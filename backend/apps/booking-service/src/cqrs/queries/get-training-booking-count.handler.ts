import { QueryHandler } from '@nestjs/cqrs';
import { IQueryHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { GetTrainingBookingCountQuery } from './get-training-booking-count.query';
import { TrainingBookingCountDto } from '@app/contracts/booking';

@QueryHandler(GetTrainingBookingCountQuery)
export class GetTrainingBookingCountHandler implements IQueryHandler<GetTrainingBookingCountQuery> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(
    query: GetTrainingBookingCountQuery,
  ): Promise<TrainingBookingCountDto> {
    const { trainingId } = query;

    const confirmedCount =
      await this.bookingRepository.countConfirmedByTrainingId(trainingId);

    return {
      confirmedCount,
      waitlistCount: 0,
    };
  }
}
