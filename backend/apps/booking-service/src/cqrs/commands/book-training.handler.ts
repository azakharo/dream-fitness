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
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

@CommandHandler(BookTrainingCommand)
export class BookTrainingHandler implements ICommandHandler<BookTrainingCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly trainingClientService: TrainingClientService,
    private readonly authClientService: AuthClientService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: BookTrainingCommand): Promise<Booking> {
    const { userId, trainingId, jwtToken } = command;

    const existingBooking = await this.bookingRepository.findByUserAndTraining(
      userId,
      trainingId,
    );
    if (existingBooking) {
      throw new DuplicateBookingException(userId, trainingId);
    }

    const training = await this.trainingClientService.getTraining(
      trainingId,
      jwtToken,
    );

    const confirmedBookingsCount =
      await this.bookingRepository.countConfirmedByTrainingId(trainingId);
    const availableSlots = training.capacity - confirmedBookingsCount;

    if (availableSlots <= 0) {
      throw new NoAvailableSlotsException(trainingId);
    }

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
      const trainingDateTime = format(
        new Date(training.scheduledAt),
        'd MMMM yyyy, HH:mm',
        { locale: ru },
      );

      const savedBooking = await this.bookingRepository.save(booking);
      this.eventBus.publish(
        new BookingCreatedEvent(
          savedBooking.id,
          savedBooking.trainingId,
          savedBooking.userId,
          training.title,
          trainingDateTime,
          training.trainerName || 'Тренер',
        ),
      );
      return savedBooking;
    } catch (error) {
      await this.authClientService.releasePoints(userId, price, bookingId);
      throw error;
    }
  }
}
