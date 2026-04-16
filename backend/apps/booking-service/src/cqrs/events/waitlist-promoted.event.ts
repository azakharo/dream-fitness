import { IEvent } from '@nestjs/cqrs';

export class WaitlistPromotedEvent implements IEvent {
  constructor(
    public readonly waitlistId: string,
    public readonly trainingId: string,
    public readonly userId: string,
  ) {}
}
