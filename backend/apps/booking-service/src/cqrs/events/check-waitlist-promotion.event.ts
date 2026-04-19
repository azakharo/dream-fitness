import { IEvent } from '@nestjs/cqrs';

export class CheckWaitlistPromotionEvent implements IEvent {
  constructor(
    public readonly trainingId: string,
    public readonly waitlistId: string,
  ) {}
}
