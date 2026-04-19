import { QueryHandler } from '@nestjs/cqrs';
import { IQueryHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { Booking } from '../../bookings/entities/booking.entity';
import { GetUserBookingsQuery } from './get-user-bookings.query';
import { normalizePaginationParams } from '@app/shared';
import { BookingStatus } from '@app/shared/enums';

@QueryHandler(GetUserBookingsQuery)
export class GetUserBookingsHandler implements IQueryHandler<GetUserBookingsQuery> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(
    query: GetUserBookingsQuery,
  ): Promise<{ items: Booking[]; total: number; page: number; limit: number }> {
    const { userId, filters } = query;
    const normalizedFilters = filters || {};
    const { limit, skip } = normalizePaginationParams(normalizedFilters);

    const { data, total } = await this.bookingRepository.findByUserId(userId, {
      ...normalizedFilters,
      status: normalizedFilters.status as BookingStatus | undefined,
    });

    return {
      items: data,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
    };
  }
}
