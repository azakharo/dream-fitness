import { Injectable } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { Booking } from '../../bookings/entities/booking.entity';
import { GetBookingByIdQuery } from './get-booking-by-id.query';
import { BookingNotFoundException } from '../../common/exceptions';

@Injectable()
export class GetBookingByIdHandler implements IQueryHandler<GetBookingByIdQuery> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(query: GetBookingByIdQuery): Promise<Booking> {
    const { bookingId, userId } = query;

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    if (booking.userId !== userId) {
      throw new Error('You do not have permission to view this booking');
    }

    return booking;
  }
}
