import { Command } from '@nestjs/cqrs';
import { Waitlist } from '../../waitlist/entities/waitlist.entity';

export class JoinWaitlistCommand extends Command<Waitlist> {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
  ) {
    super();
  }
}
