import { Injectable } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { GetWaitlistPositionQuery } from './get-waitlist-position.query';
import { NotOnWaitlistException } from '../../common/exceptions';

@Injectable()
export class GetWaitlistPositionHandler implements IQueryHandler<GetWaitlistPositionQuery> {
  constructor(private readonly waitlistRepository: WaitlistRepository) {}

  async execute(
    query: GetWaitlistPositionQuery,
  ): Promise<{ position: number; totalInQueue: number; waitlistId: string }> {
    const { userId, trainingId } = query;

    const positionResult = await this.waitlistRepository.getPositionByUserId(
      userId,
      trainingId,
    );

    if (!positionResult) {
      throw new NotOnWaitlistException(userId, trainingId);
    }

    return {
      position: positionResult.position,
      totalInQueue: positionResult.totalInQueue,
      waitlistId: positionResult.waitlistId,
    };
  }
}
