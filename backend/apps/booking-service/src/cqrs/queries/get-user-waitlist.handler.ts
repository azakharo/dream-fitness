import { QueryHandler } from '@nestjs/cqrs';
import { IQueryHandler } from '@nestjs/cqrs';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { GetUserWaitlistQuery } from './get-user-waitlist.query';
import { WaitlistResponseDto } from '@app/contracts/booking';

@QueryHandler(GetUserWaitlistQuery)
export class GetUserWaitlistHandler implements IQueryHandler<GetUserWaitlistQuery> {
  constructor(private readonly waitlistRepository: WaitlistRepository) {}

  async execute(query: GetUserWaitlistQuery): Promise<WaitlistResponseDto[]> {
    const { userId } = query;

    const waitlistEntries = await this.waitlistRepository.findByUserId(userId);

    const results: WaitlistResponseDto[] = [];
    for (const entry of waitlistEntries) {
      const positionInfo = await this.waitlistRepository.getPositionByUserId(
        userId,
        entry.trainingId,
      );
      results.push({
        id: entry.id,
        userId: entry.userId,
        trainingId: entry.trainingId,
        position: positionInfo?.position ?? 0,
        joinedAt: entry.createdAt.toISOString(),
      });
    }
    return results;
  }
}
