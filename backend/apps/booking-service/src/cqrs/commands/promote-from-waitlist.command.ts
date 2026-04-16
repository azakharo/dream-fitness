import { Command } from '@nestjs/cqrs';

export class PromoteFromWaitlistCommand extends Command<void> {
  constructor(public readonly trainingId: string) {
    super();
  }
}
