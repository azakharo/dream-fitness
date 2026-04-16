import { Command } from '@nestjs/cqrs';
import { Booking } from '../../bookings/entities/booking.entity';

export class BookTrainingCommand extends Command<Booking> {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
  ) {
    super();
  }
}
