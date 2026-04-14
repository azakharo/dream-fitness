import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between } from 'typeorm';
import { Training } from '../entities/training.entity';
import { TrainingStatus } from '@app/shared';

@Injectable()
export class TrainingRepository extends Repository<Training> {
  constructor(dataSource: DataSource) {
    super(Training, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Training | undefined> {
    const training = await this.findOne({
      where: { id },
      select: [
        'id',
        'trainerId',
        'title',
        'description',
        'type',
        'scheduledAt',
        'durationMinutes',
        'capacity',
        'price',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
    return training ?? undefined;
  }

  async findWithFilters(filterDto: {
    type?: string;
    trainerId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Training[]; total: number }> {
    const queryBuilder = this.createQueryBuilder('training');

    if (filterDto.type) {
      queryBuilder.andWhere('training.type = :type', { type: filterDto.type });
    }

    if (filterDto.trainerId) {
      queryBuilder.andWhere('training.trainerId = :trainerId', {
        trainerId: filterDto.trainerId,
      });
    }

    if (filterDto.dateFrom) {
      queryBuilder.andWhere('training.scheduledAt >= :dateFrom', {
        dateFrom: filterDto.dateFrom,
      });
    }

    if (filterDto.dateTo) {
      queryBuilder.andWhere('training.scheduledAt <= :dateTo', {
        dateTo: filterDto.dateTo,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('training.scheduledAt', 'ASC')
      .skip(((filterDto.page || 1) - 1) * (filterDto.limit || 10))
      .take(filterDto.limit || 10)
      .getManyAndCount();

    return { data, total };
  }

  async findByDateRange(dateFrom: string, dateTo: string): Promise<Training[]> {
    return this.find({
      where: {
        scheduledAt: Between(new Date(dateFrom), new Date(dateTo)),
        status: TrainingStatus.SCHEDULED,
      },
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByTrainerAndDateRange(
    trainerId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<Training[]> {
    return this.find({
      where: {
        trainerId,
        scheduledAt: Between(new Date(dateFrom), new Date(dateTo)),
        status: TrainingStatus.SCHEDULED,
      },
      order: { scheduledAt: 'ASC' },
    });
  }

  countActiveBookings(): number {
    return 0;
  }
}
