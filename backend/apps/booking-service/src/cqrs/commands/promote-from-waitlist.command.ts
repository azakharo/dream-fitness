import { Command } from '@nestjs/cqrs';
import { Booking } from '../../bookings/entities/booking.entity';

export class PromoteFromWaitlistCommand extends Command<Booking | null> {
  constructor(public readonly trainingId: string) {
    super();
  }
}
