import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { BookingRepository } from '../../bookings/repositories/booking.repository';
import { TrainingClientService } from '../../clients/training-client.service';
import { AuthClientService } from '../../clients/auth-client.service';
import { BookingCreatedEvent } from '../events';
import { EventBus } from '@nestjs/cqrs';
import { Booking } from '../../bookings/entities/booking.entity';
import { BookingStatus } from '@app/shared/enums';
import { DuplicateBookingException } from '../../common/exceptions';
import { NoAvailableSlotsException } from '../../common/exceptions';
import { BookTrainingCommand } from './book-training.command';

@Injectable()
export class BookTrainingHandler implements ICommandHandler<BookTrainingCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly authClientService: AuthClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: BookTrainingCommand): Promise<Booking> {
    const { userId, trainingId } = command;

    const existingBooking = await this.bookingRepository.findByUserAndTraining(
      userId,
      trainingId,
    );
    if (existingBooking) {
      throw new DuplicateBookingException(userId, trainingId);
    }

    const availability =
      await this.trainingClientService.getAvailability(trainingId);
    if (!availability.isAvailable || availability.availableSlots <= 0) {
      throw new NoAvailableSlotsException(trainingId);
    }

    const training = await this.trainingClientService.getTraining(trainingId);
    const bookingId = crypto.randomUUID();
    const price = training.price;

    await this.authClientService.reservePoints(userId, price, bookingId);

    const booking = this.bookingRepository.create({
      id: bookingId,
      userId,
      trainingId,
      status: BookingStatus.CONFIRMED,
    });

    try {
      const savedBooking = await this.bookingRepository.save(booking);
      this.eventBus.publish(
        new BookingCreatedEvent(
          savedBooking.id,
          savedBooking.trainingId,
          savedBooking.userId,
        ),
      );
      return savedBooking;
    } catch (error) {
      await this.authClientService.releasePoints(userId, price, bookingId);
      throw error;
    }
  }
}
