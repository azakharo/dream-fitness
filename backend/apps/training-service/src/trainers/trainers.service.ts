import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { TrainerRepository } from './repositories/trainer.repository';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { TrainerResponseDto } from './dto/trainer-response.dto';
import { Trainer } from './entities/trainer.entity';
import { TrainerNotFoundException } from '../common/exceptions/trainer-not-found.exception';
import { TrainerAlreadyExistsException } from '../common/exceptions/trainer-already-exists.exception';

@Injectable()
export class TrainersService {
  constructor(private readonly trainerRepository: TrainerRepository) {}

  private toResponseDto(trainer: Trainer): TrainerResponseDto {
    return {
      id: trainer.id,
      name: trainer.name,
      bio: trainer.bio,
      avatarUrl: trainer.avatarUrl,
      isActive: trainer.isActive,
      createdAt: trainer.createdAt.toISOString(),
      updatedAt: trainer.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateTrainerDto): Promise<TrainerResponseDto> {
    const existingTrainer = await this.trainerRepository.findByName(dto.name);
    if (existingTrainer) {
      throw new TrainerAlreadyExistsException(dto.name);
    }

    const trainer = this.trainerRepository.create(dto as DeepPartial<Trainer>);
    const savedTrainer = await this.trainerRepository.save(trainer);
    return this.toResponseDto(savedTrainer);
  }

  async update(id: string, dto: UpdateTrainerDto): Promise<TrainerResponseDto> {
    const trainer = await this.trainerRepository.findById(id);
    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }

    const updatedTrainer = await this.trainerRepository.save({
      ...trainer,
      ...dto,
    } as DeepPartial<Trainer>);
    return this.toResponseDto(updatedTrainer);
  }

  async remove(id: string): Promise<void> {
    const trainer = await this.trainerRepository.findById(id);
    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }

    await this.trainerRepository.save({
      ...trainer,
      isActive: false,
    } as DeepPartial<Trainer>);
  }

  async findById(id: string): Promise<TrainerResponseDto | null> {
    const trainer = await this.trainerRepository.findById(id);
    return trainer ? this.toResponseDto(trainer) : null;
  }

  async findActive(): Promise<TrainerResponseDto[]> {
    const trainers = await this.trainerRepository.findActive();
    return trainers.map((trainer) => this.toResponseDto(trainer));
  }
}
