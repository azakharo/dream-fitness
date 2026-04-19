import { IEvent } from '@nestjs/cqrs';

export class WaitlistJoinedEvent implements IEvent {
  constructor(
    public readonly waitlistId: string,
    public readonly trainingId: string,
    public readonly userId: string,
    public readonly position: number,
  ) {}
}
