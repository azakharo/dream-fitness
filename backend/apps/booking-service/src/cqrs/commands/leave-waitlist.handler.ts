import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { NotOnWaitlistException } from '../../common/exceptions';

@Injectable()
export class LeaveWaitlistHandler implements ICommandHandler<LeaveWaitlistCommand> {
  constructor(
    private readonly waitlistRepository: WaitlistRepository,
  ) {}

  async execute(command: LeaveWaitlistCommand): Promise<void> {
    const { userId, trainingId } = command;

    const waitlistEntry = await this.waitlistRepository.findByUserAndTraining(
      userId,
      trainingId,
    );

    if (!waitlistEntry) {
      throw new NotOnWaitlistException(userId, trainingId);
    }

    await this.waitlistRepository.remove(waitlistEntry);
  }
}
