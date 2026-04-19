import { IEvent } from '@nestjs/cqrs';

export class BookingCreatedEvent implements IEvent {
  constructor(
    public readonly bookingId: string,
    public readonly trainingId: string,
    public readonly userId: string,
  ) {}
}
