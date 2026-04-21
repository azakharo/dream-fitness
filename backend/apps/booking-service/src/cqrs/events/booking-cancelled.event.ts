import { IEvent } from '@nestjs/cqrs';

export class BookingCancelledEvent implements IEvent {
  constructor(
    public readonly bookingId: string,
    public readonly trainingId: string,
    public readonly userId: string,
    public readonly userEmail: string,
    public readonly reason?: string,
    public readonly trainingName?: string,
    public readonly trainingDateTime?: string,
    public readonly trainerName?: string,
  ) {}
}
