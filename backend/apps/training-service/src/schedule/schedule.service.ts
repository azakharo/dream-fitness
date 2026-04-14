import { Injectable } from '@nestjs/common';
import { TrainingRepository } from '../trainings/repositories/training.repository';
import { TrainersService } from '../trainers/trainers.service';
import { TrainerNotFoundException } from '../common/exceptions/trainer-not-found.exception';
import { Training } from '../trainings/entities/training.entity';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly trainingRepository: TrainingRepository,
    private readonly trainersService: TrainersService,
  ) {}

  async getWeekSchedule(weekStart?: string) {
    let startDate: Date;

    if (weekStart) {
      startDate = new Date(weekStart);
    } else {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
    }

    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const trainings = await this.trainingRepository.findByDateRange(
      startDate.toISOString(),
      endDate.toISOString(),
    );

    const days: Array<{
      date: string;
      dayOfWeek: string;
      trainings: Array<{
        id: string;
        title: string;
        type: string;
        scheduledAt: string;
        durationMinutes: number;
        capacity: number;
        price: number;
        trainerId: string;
        trainerName: string;
      }>;
    }> = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0);

      const dayTrainings = trainings.filter(
        (training) =>
          training.scheduledAt >= currentDate &&
          training.scheduledAt <
            new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      );

      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      days.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: dayNames[currentDate.getDay()],
        trainings: dayTrainings.map((training) =>
          this.mapTrainingWithTrainer(training),
        ),
      });
    }

    return {
      weekStart: startDate.toISOString(),
      weekEnd: endDate.toISOString(),
      days,
    };
  }

  async getTrainerSchedule(
    trainerId: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const trainer = await this.trainersService.findById(trainerId);
    if (!trainer) {
      throw new TrainerNotFoundException(trainerId);
    }

    if (!dateFrom) {
      dateFrom = new Date().toISOString();
    }

    if (!dateTo) {
      const today = new Date(dateFrom);
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      dateTo = thirtyDaysLater.toISOString();
    }

    const trainings = await this.trainingRepository.findByTrainerAndDateRange(
      trainerId,
      dateFrom,
      dateTo,
    );

    return {
      trainer: {
        id: trainer.id,
        name: trainer.name,
      },
      trainings: trainings.map((training) =>
        this.mapTrainingWithTrainer(training),
      ),
    };
  }

  private mapTrainingWithTrainer(training: Training) {
    return {
      id: training.id,
      title: training.title,
      type: training.type,
      scheduledAt: training.scheduledAt.toISOString(),
      durationMinutes: training.durationMinutes,
      capacity: training.capacity,
      price: training.price,
      trainerId: training.trainerId,
      trainerName: training.trainer?.name || 'Unknown',
    };
  }
}
