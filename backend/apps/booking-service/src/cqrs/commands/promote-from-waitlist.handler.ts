import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { TrainingClientService } from '../../clients/training-client.service';
import { AuthClientService } from '../../clients/auth-client.service';
import { BookingCreatedEvent, WaitlistPromotedEvent } from '../events';
import { EventBus } from '@nestjs/cqrs';
import { Booking } from '../../bookings/entities/booking.entity';
import { BookingStatus } from '@app/shared/enums';
import { PromoteFromWaitlistCommand } from './promote-from-waitlist.command';

@Injectable()
export class PromoteFromWaitlistHandler implements ICommandHandler<PromoteFromWaitlistCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly waitlistRepository: WaitlistRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly authClientService: AuthClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PromoteFromWaitlistCommand) {
    const { trainingId } = command;

    const availability =
      await this.trainingClientService.getAvailability(trainingId);
    if (!availability.isAvailable || availability.availableSlots <= 0) {
      return;
    }

    let waitlistEntry =
      await this.waitlistRepository.findFirstByTrainingId(trainingId);
    if (!waitlistEntry) {
      return;
    }

    while (waitlistEntry) {
      const training = await this.trainingClientService.getTraining(trainingId);
      const bookingId = crypto.randomUUID();
      const price = training.price;

      try {
        await this.authClientService.reservePoints(
          waitlistEntry.userId,
          price,
          bookingId,
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
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
        const savedBooking = await this.bookingRepository.save(booking);
        await this.waitlistRepository.remove(waitlistEntry);
        this.eventBus.publish(
          new BookingCreatedEvent(
            savedBooking.id,
            savedBooking.trainingId,
            savedBooking.userId,
          ),
        );
        this.eventBus.publish(
          new WaitlistPromotedEvent(
            waitlistEntry.id,
            waitlistEntry.trainingId,
            waitlistEntry.userId,
          ),
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
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
    }
  }
}
