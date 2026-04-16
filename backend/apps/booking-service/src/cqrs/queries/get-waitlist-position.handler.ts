import { Injectable } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { GetWaitlistPositionQuery } from './get-waitlist-position.query';
import { NotOnWaitlistException } from '../../common/exceptions';
import { WaitlistPositionResponseDto } from '../../waitlist/dto/waitlist-position-response.dto';

@Injectable()
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

    if (!positionResult) {
      throw new NotOnWaitlistException(userId, trainingId);
    }

    const response = new WaitlistPositionResponseDto();
    response.position = positionResult.position;
    response.totalInQueue = positionResult.totalInQueue;
    response.waitlistId = positionResult.waitlistId;
    return response;
  }
}
