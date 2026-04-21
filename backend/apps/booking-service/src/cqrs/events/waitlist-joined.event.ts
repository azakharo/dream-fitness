import { IEvent } from '@nestjs/cqrs';

export class WaitlistJoinedEvent implements IEvent {
  constructor(
    public readonly waitlistId: string,
    public readonly trainingId: string,
    public readonly userId: string,
    public readonly userEmail: string,
    public readonly position: number,
    public readonly trainingName: string,
    public readonly trainingDateTime: string,
    public readonly trainerName: string,
  ) {}
}
