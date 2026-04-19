import { Command } from '@nestjs/cqrs';

export class LeaveWaitlistCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
  ) {
    super();
  }
}
