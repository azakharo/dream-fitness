import { CommandHandler } from '@nestjs/cqrs';
import { ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { TrainingClientService } from '../../clients/training-client.service';
import { AuthClientService } from '../../clients/auth-client.service';
import { BookingCreatedEvent, WaitlistPromotedEvent } from '../events';
import { EventBus } from '@nestjs/cqrs';
import { BookingStatus } from '@app/shared/enums';
import { PromoteFromWaitlistCommand } from './promote-from-waitlist.command';
import { formatDateTime } from '@app/shared';

@CommandHandler(PromoteFromWaitlistCommand)
export class PromoteFromWaitlistHandler implements ICommandHandler<PromoteFromWaitlistCommand> {
  private readonly logger = new Logger(PromoteFromWaitlistHandler.name);

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly waitlistRepository: WaitlistRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly authClientService: AuthClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PromoteFromWaitlistCommand) {
    const { trainingId } = command;

    const training = await this.trainingClientService.getTraining(trainingId);
    const confirmedBookingsCount =
      await this.bookingRepository.countConfirmedByTrainingId(trainingId);
    const availableSlots = training.capacity - confirmedBookingsCount;

    if (availableSlots <= 0) {
      return;
    }

    let waitlistEntry =
      await this.waitlistRepository.findFirstByTrainingId(trainingId);
    if (!waitlistEntry) {
      return;
    }

    let remainingSlots = availableSlots;

    while (waitlistEntry && remainingSlots > 0) {
      const bookingId = crypto.randomUUID();
      const price = training.price;

      try {
        await this.authClientService.reservePoints(
          waitlistEntry.userId,
          price,
          bookingId,
        );
      } catch {
        this.logger.warn(
          `Failed to reserve points for waitlisted user ${waitlistEntry.userId}, skipping`,
        );
        await this.waitlistRepository.remove(waitlistEntry);
        waitlistEntry =
          await this.waitlistRepository.findFirstByTrainingId(trainingId);
        continue;
      }

      const booking = this.bookingRepository.create({
        id: bookingId,
        userId: waitlistEntry.userId,
        trainingId,
        status: BookingStatus.CONFIRMED,
      });

      try {
        const trainingDateTime = formatDateTime(training.scheduledAt);

        const savedBooking = await this.bookingRepository.save(booking);
        await this.waitlistRepository.remove(waitlistEntry);
        remainingSlots--;

        const userEmail = await this.authClientService.getUserEmail(
          waitlistEntry.userId,
        );

        this.eventBus.publish(
          new BookingCreatedEvent(
            savedBooking.id,
            savedBooking.trainingId,
            savedBooking.userId,
            userEmail,
            training.title,
            trainingDateTime,
            training.trainerName || 'Тренер',
          ),
        );
        this.eventBus.publish(
          new WaitlistPromotedEvent(
            waitlistEntry.id,
            waitlistEntry.trainingId,
            waitlistEntry.userId,
            userEmail,
            training.title,
            trainingDateTime,
            training.trainerName || 'Тренер',
          ),
        );
      } catch {
        this.logger.error(
          `Failed to save promoted booking for user ${waitlistEntry.userId}`,
        );
        await this.authClientService.releasePoints(
          waitlistEntry.userId,
          price,
          bookingId,
        );
        await this.waitlistRepository.remove(waitlistEntry);
        waitlistEntry =
          await this.waitlistRepository.findFirstByTrainingId(trainingId);
        continue;
      }

      waitlistEntry =
        await this.waitlistRepository.findFirstByTrainingId(trainingId);
    }
  }
}
