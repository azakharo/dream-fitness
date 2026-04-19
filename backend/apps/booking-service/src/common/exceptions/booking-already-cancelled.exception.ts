import { ConflictException } from '@nestjs/common';

export class BookingAlreadyCancelledException extends ConflictException {
  constructor(bookingId: string) {
    super(`Booking ${bookingId} is already cancelled`);
  }
}
