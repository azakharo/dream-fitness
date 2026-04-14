import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { TrainingRepository } from './repositories/training.repository';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { TrainingResponseDto } from './dto/training-response.dto';
import { Training } from './entities/training.entity';
import { TrainersService } from '../trainers/trainers.service';
import { TrainerNotFoundException } from '../common/exceptions/trainer-not-found.exception';
import { TrainerNotActiveException } from '../common/exceptions/trainer-not-active.exception';
import { TrainingNotFoundException } from '../common/exceptions/training-not-found.exception';
import { TrainingAlreadyCancelledException } from '../common/exceptions/training-already-cancelled.exception';
import { ScheduleConflictException } from '../common/exceptions/schedule-conflict.exception';
import { PastDateException } from '../common/exceptions/past-date.exception';
import { TrainingStatus } from '@app/shared';
import { EventsPublisher } from '../events/events.publisher';

@Injectable()
export class TrainingsService {
  constructor(
    private readonly trainingRepository: TrainingRepository,
    private readonly trainersService: TrainersService,
    private readonly eventsPublisher: EventsPublisher,
  ) {}

  private toResponseDto(training: Training): TrainingResponseDto {
    const availableSlots =
      training.capacity - this.trainingRepository.countActiveBookings();
    return {
      id: training.id,
      trainerId: training.trainerId,
      title: training.title,
      description: training.description,
      type: training.type,
      scheduledAt: training.scheduledAt.toISOString(),
      durationMinutes: training.durationMinutes,
      capacity: training.capacity,
      price: training.price,
      status: training.status,
      createdAt: training.createdAt.toISOString(),
      updatedAt: training.updatedAt.toISOString(),
      availableSlots,
      currentParticipants: training.capacity - availableSlots,
    };
  }

  async create(dto: CreateTrainingDto): Promise<TrainingResponseDto> {
    const trainer = await this.trainersService.findById(dto.trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(dto.trainerId);
    }
    if (!trainer.isActive) {
      throw new TrainerNotActiveException(dto.trainerId);
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt < new Date()) {
      throw new PastDateException();
    }

    const trainerTrainings =
      await this.trainingRepository.findByTrainerAndDateRange(
        dto.trainerId,
        dto.scheduledAt,
        dto.scheduledAt,
      );
    if (trainerTrainings.length > 0) {
      throw new ScheduleConflictException(dto.trainerId, dto.scheduledAt);
    }

    const training = this.trainingRepository.create({
      ...dto,
      scheduledAt,
    } as DeepPartial<Training>);

    const savedTraining = await this.trainingRepository.save(training);

    const response = this.toResponseDto(savedTraining);
    await this.eventsPublisher.publishTrainingCreated({
      trainingId: response.id,
      title: response.title,
      type: response.type,
      trainerId: response.trainerId,
      scheduledAt: response.scheduledAt,
      durationMinutes: response.durationMinutes,
      capacity: response.capacity,
      price: response.price,
    });
    return response;
  }

  async update(
    id: string,
    dto: UpdateTrainingDto,
  ): Promise<TrainingResponseDto> {
    const training = await this.trainingRepository.findById(id);
    if (!training) {
      throw new TrainingNotFoundException(id);
    }

    if (training.status === TrainingStatus.CANCELLED) {
      throw new TrainingAlreadyCancelledException(id);
    }

    if (dto.trainerId && dto.trainerId !== training.trainerId) {
      const trainer = await this.trainersService.findById(dto.trainerId);
      if (!trainer) {
        throw new TrainerNotFoundException(dto.trainerId);
      }
      if (!trainer.isActive) {
        throw new TrainerNotActiveException(dto.trainerId);
      }

      const trainerTrainings =
        await this.trainingRepository.findByTrainerAndDateRange(
          dto.trainerId,
          dto.scheduledAt || training.scheduledAt.toISOString(),
          dto.scheduledAt || training.scheduledAt.toISOString(),
        );
      if (trainerTrainings.length > 0) {
        throw new ScheduleConflictException(
          dto.trainerId,
          dto.scheduledAt || training.scheduledAt.toISOString(),
        );
      }
    }

    const updatedTraining = await this.trainingRepository.save({
      ...training,
      ...dto,
    } as DeepPartial<Training>);
    const response = this.toResponseDto(updatedTraining);
    await this.eventsPublisher.publishTrainingUpdated({
      trainingId: response.id,
      changes: dto as Record<string, unknown>,
      updatedAt: response.updatedAt,
    });
    return response;
  }

  async remove(id: string): Promise<void> {
    const training = await this.trainingRepository.findById(id);
    if (!training) {
      throw new TrainingNotFoundException(id);
    }

    if (training.status === TrainingStatus.CANCELLED) {
      throw new TrainingAlreadyCancelledException(id);
    }

    await this.trainingRepository.save({
      ...training,
      status: TrainingStatus.CANCELLED,
    } as DeepPartial<Training>);
    await this.eventsPublisher.publishTrainingCancelled(training.id);
  }

  async findById(id: string): Promise<TrainingResponseDto> {
    const training = await this.trainingRepository.findById(id);
    if (!training) {
      throw new TrainingNotFoundException(id);
    }
    return this.toResponseDto(training);
  }

  async findAll(filterDto: {
    type?: string;
    trainerId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: TrainingResponseDto[]; total: number }> {
    const { data, total } =
      await this.trainingRepository.findWithFilters(filterDto);
    return {
      data: data.map((training) => this.toResponseDto(training)),
      total,
    };
  }

  async getAvailability(id: string): Promise<{
    trainingId: string;
    capacity: number;
    currentParticipants: number;
    availableSlots: number;
    isAvailable: boolean;
  }> {
    const training = await this.trainingRepository.findById(id);
    if (!training) {
      throw new TrainingNotFoundException(id);
    }

    const currentParticipants = this.trainingRepository.countActiveBookings();
    const availableSlots = training.capacity - currentParticipants;
    const isAvailable = availableSlots > 0;

    return {
      trainingId: training.id,
      capacity: training.capacity,
      currentParticipants,
      availableSlots,
      isAvailable,
    };
  }
}
