import { CommandHandler } from '@nestjs/cqrs';
import { ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { TrainingClientService } from '../../clients/training-client.service';
import { AuthClientService } from '../../clients/auth-client.service';
import { WaitlistJoinedEvent } from '../events';
import { AlreadyOnWaitlistException } from '../../common/exceptions';
import { DuplicateBookingException } from '../../common/exceptions';
import { JoinWaitlistCommand } from './join-waitlist.command';
import { WaitlistResponseDto } from '../../waitlist/dto';
import { formatDateTime } from '@app/shared';

@CommandHandler(JoinWaitlistCommand)
export class JoinWaitlistHandler implements ICommandHandler<JoinWaitlistCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly waitlistRepository: WaitlistRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly authClientService: AuthClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: JoinWaitlistCommand) {
    const { userId, trainingId } = command;

    const existingBooking = await this.bookingRepository.findByUserAndTraining(
      userId,
      trainingId,
    );
    if (existingBooking) {
      throw new DuplicateBookingException(userId, trainingId);
    }

    const existingWaitlistEntry =
      await this.waitlistRepository.findByUserAndTraining(userId, trainingId);
    if (existingWaitlistEntry) {
      throw new AlreadyOnWaitlistException(userId, trainingId);
    }

    const training = await this.trainingClientService.getTraining(
      trainingId,
      command.jwtToken,
    );

    const trainingDateTime = formatDateTime(training.scheduledAt);

    const waitlistEntry = this.waitlistRepository.create({
      userId,
      trainingId,
    });

    const savedEntry = await this.waitlistRepository.save(waitlistEntry);
    const positionResult = await this.waitlistRepository.getPositionByUserId(
      userId,
      trainingId,
    );

    if (!positionResult) {
      throw new Error('Failed to get waitlist position');
    }

    const userEmail = await this.authClientService.getUserEmail(userId);

    this.eventBus.publish(
      new WaitlistJoinedEvent(
        savedEntry.id,
        savedEntry.trainingId,
        savedEntry.userId,
        userEmail,
        positionResult.position,
        training.title,
        trainingDateTime,
        training.trainerName || 'Тренер',
      ),
    );

    const response = new WaitlistResponseDto();
    response.id = savedEntry.id;
    response.userId = savedEntry.userId;
    response.trainingId = savedEntry.trainingId;
    response.position = positionResult.position;
    response.joinedAt = savedEntry.createdAt.toISOString();
    return response;
  }
}
