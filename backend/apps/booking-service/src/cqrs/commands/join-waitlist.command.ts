import { Command } from '@nestjs/cqrs';
import { WaitlistResponseDto } from '../../waitlist/dto';

export class JoinWaitlistCommand extends Command<WaitlistResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
    public readonly userRole?: string,
  ) {
    super();
  }
}
