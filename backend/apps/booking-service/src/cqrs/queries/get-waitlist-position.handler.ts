import { QueryHandler } from '@nestjs/cqrs';
import { IQueryHandler } from '@nestjs/cqrs';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { GetWaitlistPositionQuery } from './get-waitlist-position.query';
import { WaitlistPositionResponseDto } from '../../waitlist/dto/waitlist-position-response.dto';

@QueryHandler(GetWaitlistPositionQuery)
export class GetWaitlistPositionHandler implements IQueryHandler<GetWaitlistPositionQuery> {
  constructor(private readonly waitlistRepository: WaitlistRepository) {}

  async execute(
    query: GetWaitlistPositionQuery,
  ): Promise<WaitlistPositionResponseDto> {
    const { userId, trainingId } = query;

    const positionResult = await this.waitlistRepository.getPositionByUserId(
      userId,
      trainingId,
    );

    const response = new WaitlistPositionResponseDto();

    if (!positionResult) {
      response.position = -1;
      response.totalInQueue = 0;
      response.waitlistId = '';
      return response;
    }

    response.position = positionResult.position;
    response.totalInQueue = positionResult.totalInQueue;
    response.waitlistId = positionResult.waitlistId;
    return response;
  }
}
