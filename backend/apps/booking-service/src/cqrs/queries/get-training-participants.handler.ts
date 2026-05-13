import { QueryHandler } from '@nestjs/cqrs';
import { IQueryHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { AuthClientService } from '../../clients/auth-client.service';
import { GetTrainingParticipantsQuery } from './get-training-participants.query';
import { UserDto } from '@app/contracts/auth';

@QueryHandler(GetTrainingParticipantsQuery)
export class GetTrainingParticipantsHandler implements IQueryHandler<GetTrainingParticipantsQuery> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly authClient: AuthClientService,
  ) {}

  async execute(query: GetTrainingParticipantsQuery): Promise<UserDto[]> {
    const { trainingId, userId, userRole } = query;

    const bookings =
      await this.bookingRepository.findConfirmedByTrainingId(trainingId);

    const userIds = [...new Set(bookings.map((b) => b.userId))];

    if (userIds.length === 0) {
      return [];
    }

    return this.authClient.getUsersByIds(userId, userRole, userIds);
  }
}
