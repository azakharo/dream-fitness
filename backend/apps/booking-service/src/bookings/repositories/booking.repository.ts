import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { BookingStatus } from '@app/shared/enums';
import { PaginationParams, normalizePaginationParams } from '@app/shared';

@Injectable()
export class BookingRepository extends Repository<Booking> {
  constructor(dataSource: DataSource) {
    super(Booking, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Booking | undefined> {
    const booking = await this.findOne({
      where: { id },
      select: [
        'id',
        'userId',
        'trainingId',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
    return booking ?? undefined;
  }

  async findByUserId(
    userId: string,
    filters: PaginationParams & { status?: BookingStatus; trainingId?: string },
  ): Promise<{ data: Booking[]; total: number }> {
    const { limit, skip } = normalizePaginationParams(filters);

    const queryBuilder = this.createQueryBuilder('booking');

    queryBuilder.where('booking.userId = :userId', { userId });

    if (filters.status) {
      queryBuilder.andWhere('booking.status = :status', {
        status: filters.status,
      });
    }

    if (filters.trainingId) {
      queryBuilder.andWhere('booking.trainingId = :trainingId', {
        trainingId: filters.trainingId,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findByUserAndTraining(
    userId: string,
    trainingId: string,
  ): Promise<Booking | null> {
    return this.findOne({
      where: {
        userId,
        trainingId,
        status: BookingStatus.CONFIRMED,
      },
    });
  }

  async countConfirmedByTrainingId(trainingId: string): Promise<number> {
    return this.count({
      where: {
        trainingId,
        status: BookingStatus.CONFIRMED,
      },
    });
  }

  async findConfirmedByTrainingId(trainingId: string): Promise<Booking[]> {
    return this.find({
      where: {
        trainingId,
        status: BookingStatus.CONFIRMED,
      },
    });
  }
}
