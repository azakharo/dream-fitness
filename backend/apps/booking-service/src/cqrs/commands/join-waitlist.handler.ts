import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';
import { TrainingClientService } from '../../clients/training-client.service';
import { WaitlistJoinedEvent } from '../events';
import { EventBus } from '@nestjs/cqrs';
import { Waitlist } from '../../waitlist/entities/waitlist.entity';
import { AlreadyOnWaitlistException } from '../../common/exceptions';
import { JoinWaitlistCommand } from './join-waitlist.command';

@Injectable()
export class JoinWaitlistHandler implements ICommandHandler<JoinWaitlistCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly waitlistRepository: WaitlistRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: JoinWaitlistCommand) {
    const { userId, trainingId } = command;

    const existingBooking = await this.bookingRepository.findByUserAndTraining(
      userId,
      trainingId,
    );
    if (existingBooking) {
      throw new AlreadyOnWaitlistException(userId, trainingId);
    }

    const existingWaitlistEntry =
      await this.waitlistRepository.findByUserAndTraining(userId, trainingId);
    if (existingWaitlistEntry) {
      throw new AlreadyOnWaitlistException(userId, trainingId);
    }

    await this.trainingClientService.getTraining(trainingId);

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

    this.eventBus.publish(
      new WaitlistJoinedEvent(
        savedEntry.id,
        savedEntry.trainingId,
        savedEntry.userId,
        positionResult.position,
      ),
    );
    return savedEntry;
  }
}
