import { Injectable } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { TrainingClientService } from '../../clients/training-client.service';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { GetTrainingAvailabilityQuery } from './get-training-availability.query';
import { AvailabilityResponse } from '../../clients/training-client.service';

@Injectable()
export class GetTrainingAvailabilityHandler implements IQueryHandler<GetTrainingAvailabilityQuery> {
  constructor(
    private readonly trainingClientService: TrainingClientService,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(
    query: GetTrainingAvailabilityQuery,
  ): Promise<AvailabilityResponse & { localBookingCount: number }> {
    const { trainingId } = query;

    const availability =
      await this.trainingClientService.getAvailability(trainingId);
    const localBookingCount =
      await this.bookingRepository.countConfirmedByTrainingId(trainingId);

    return {
      ...availability,
      localBookingCount,
    };
  }
}
