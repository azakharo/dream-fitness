import { IEvent } from '@nestjs/cqrs';

export class BookingCreatedEvent implements IEvent {
  constructor(
    public readonly bookingId: string,
    public readonly trainingId: string,
    public readonly userId: string,
    public readonly trainingName: string,
    public readonly trainingDateTime: string,
    public readonly trainerName: string,
  ) {}
}
