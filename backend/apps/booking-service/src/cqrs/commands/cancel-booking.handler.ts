import { CommandHandler } from '@nestjs/cqrs';
import { ICommandHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { TrainingClientService } from '../../clients/training-client.service';
import { AuthClientService } from '../../clients/auth-client.service';
import { BookingCancelledEvent } from '../events';
import { EventBus } from '@nestjs/cqrs';
import { BookingStatus } from '@app/shared/enums';
import { BookingNotFoundException } from '../../common/exceptions';
import { ForbiddenException } from '@nestjs/common';
import { BookingAlreadyCancelledException } from '../../common/exceptions';
import { CannotCancelPastTrainingException } from '../../common/exceptions';
import { CancelBookingCommand } from './cancel-booking.command';

@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly authClientService: AuthClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelBookingCommand) {
    const { bookingId, userId, reason } = command;

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to cancel this booking',
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BookingAlreadyCancelledException(bookingId);
    }

    const training = await this.trainingClientService.getTraining(
      booking.trainingId,
      command.jwtToken,
    );
    const trainingDate = new Date(training.scheduledAt);
    const now = new Date();

    if (trainingDate < now) {
      throw new CannotCancelPastTrainingException(bookingId);
    }

    const previousStatus = booking.status;
    booking.status = BookingStatus.CANCELLED;

    try {
      await this.authClientService.refundPoints(
        userId,
        training.price,
        bookingId,
      );
    } catch (error) {
      booking.status = previousStatus;
      throw error;
    }

    const updatedBooking = await this.bookingRepository.save(booking);
    this.eventBus.publish(
      new BookingCancelledEvent(
        updatedBooking.id,
        updatedBooking.trainingId,
        updatedBooking.userId,
        reason,
      ),
    );
    return updatedBooking;
  }
}
