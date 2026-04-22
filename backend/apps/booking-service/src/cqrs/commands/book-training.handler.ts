import { CommandHandler } from '@nestjs/cqrs';
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
import { formatDateTime } from '@app/shared';

@CommandHandler(BookTrainingCommand)
export class BookTrainingHandler implements ICommandHandler<BookTrainingCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly authClientService: AuthClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: BookTrainingCommand): Promise<Booking> {
    const { userId, userRole, trainingId } = command;

    const existingBooking = await this.bookingRepository.findByUserAndTraining(
      userId,
      trainingId,
    );
    if (existingBooking) {
      throw new DuplicateBookingException(userId, trainingId);
    }

    const training = await this.trainingClientService.getTraining(
      trainingId,
      userId,
      userRole,
    );

    const confirmedBookingsCount =
      await this.bookingRepository.countConfirmedByTrainingId(trainingId);
    const availableSlots = training.capacity - confirmedBookingsCount;

    if (availableSlots <= 0) {
      throw new NoAvailableSlotsException(trainingId);
    }

    const bookingId = crypto.randomUUID();
    const price = training.price;

    await this.authClientService.reservePoints(userId, userRole, price, bookingId);

    const booking = this.bookingRepository.create({
      id: bookingId,
      userId,
      trainingId,
      status: BookingStatus.CONFIRMED,
    });

    try {
      const trainingDateTime = formatDateTime(training.scheduledAt);

      const savedBooking = await this.bookingRepository.save(booking);

      const userEmail = await this.authClientService.getUserEmail(userId);
      const userName = await this.authClientService.getUserName(userId);

      this.eventBus.publish(
        new BookingCreatedEvent(
          savedBooking.id,
          savedBooking.trainingId,
          savedBooking.userId,
          userEmail,
          userName,
          training.title,
          trainingDateTime,
          training.trainerName || 'Тренер',
        ),
      );
      return savedBooking;
    } catch (error) {
      await this.authClientService.releasePoints(userId, userRole, price, bookingId);
      throw error;
    }
  }
}
