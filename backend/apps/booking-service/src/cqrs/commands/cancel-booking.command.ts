import { Command } from '@nestjs/cqrs';
import { Booking } from '../../bookings/entities/booking.entity';

export class CancelBookingCommand extends Command<Booking> {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly reason?: string,
    public readonly jwtToken?: string,
  ) {
    super();
  }
}
