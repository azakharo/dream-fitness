import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type {
  BookingCreatedEvent,
  BookingCancelledEvent,
  WaitlistJoinedEvent,
  WaitlistPromotedEvent,
} from '@app/contracts';
import type { EventMessage } from '@app/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { NotificationType, EXCHANGES, ROUTING_KEYS, QUEUES } from '@app/shared';

@Injectable()
export class BookingEventConsumer {
  private readonly logger = new Logger(BookingEventConsumer.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.BOOKING_CREATED,
    queue: QUEUES.NOTIFICATION_BOOKING_CREATED,
  })
  async handleBookingCreated(msg: EventMessage<BookingCreatedEvent['data']>) {
    this.logger.log(`Received booking.created event: ${JSON.stringify(msg)}`);

    const {
      userId,
      userEmail,
      userName,
      trainingName,
      trainingDateTime,
      trainerName,
    } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.BOOKING_CONFIRMATION,
      title: 'Запись на тренировку подтверждена',
      content: `Вы успешно записаны на тренировку "${trainingName}". ${trainingDateTime}, тренер: ${trainerName}`,
    });

    this.emailService
      .sendTemplatedEmail(userEmail, 'booking-confirmation', {
        userName,
        trainingName,
        trainingDateTime,
        trainerName,
      })
      .catch((err) =>
        this.logger.error(
          `Failed to send booking confirmation email to ${userEmail}`,
          err,
        ),
      );
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.BOOKING_CANCELLED,
    queue: QUEUES.NOTIFICATION_BOOKING_CANCELLED,
  })
  async handleBookingCancelled(
    msg: EventMessage<BookingCancelledEvent['data']>,
  ) {
    this.logger.log(`Received booking.cancelled event: ${JSON.stringify(msg)}`);

    const {
      userId,
      userEmail,
      userName,
      trainingName,
      trainingDateTime,
      trainerName,
      reason,
    } = msg.data;

    const content = reason
      ? `Запись на тренировку "${trainingName}" отменена: ${reason}. ${trainingDateTime}, тренер: ${trainerName}`
      : `Ваша запись на тренировку "${trainingName}" отменена. ${trainingDateTime}, тренер: ${trainerName}`;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.BOOKING_CANCELLATION,
      title: 'Запись на тренировку отменена',
      content,
    });

    this.emailService
      .sendTemplatedEmail(userEmail, 'booking-cancellation', {
        userName,
        trainingName,
        trainingDateTime,
        trainerName,
        reason,
      })
      .catch((err) =>
        this.logger.error(
          `Failed to send booking cancellation email to ${userEmail}`,
          err,
        ),
      );
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.WAITLIST_JOINED,
    queue: QUEUES.NOTIFICATION_WAITLIST_JOINED,
  })
  async handleWaitlistJoined(msg: EventMessage<WaitlistJoinedEvent['data']>) {
    this.logger.log(`Received waitlist.joined event: ${JSON.stringify(msg)}`);

    const {
      userId,
      userEmail,
      userName,
      trainingName,
      trainingDateTime,
      trainerName,
      position,
    } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.WAITLIST_JOINED,
      title: 'Вы добавлены в лист ожидания',
      content: `Вы добавлены в лист ожидания на тренировку "${trainingName}". ${trainingDateTime}, тренер: ${trainerName}. Ваша позиция: ${position}`,
    });

    this.emailService
      .sendTemplatedEmail(userEmail, 'waitlist-joined', {
        userName,
        trainingName,
        trainingDateTime,
        trainerName,
        position,
      })
      .catch((err) =>
        this.logger.error(
          `Failed to send waitlist joined email to ${userEmail}`,
          err,
        ),
      );
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.WAITLIST_PROMOTED,
    queue: QUEUES.NOTIFICATION_WAITLIST_PROMOTED,
  })
  async handleWaitlistPromoted(
    msg: EventMessage<WaitlistPromotedEvent['data']>,
  ) {
    this.logger.log(`Received waitlist.promoted event: ${JSON.stringify(msg)}`);

    const {
      userId,
      userEmail,
      userName,
      trainingName,
      trainingDateTime,
      trainerName,
    } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.WAITLIST_PROMOTED,
      title: 'Место освободилось! Вы записаны',
      content: `Поздравляем! Место на тренировке "${trainingName}" освободилось, и вы были записаны автоматически. ${trainingDateTime}, тренер: ${trainerName}`,
    });

    this.emailService
      .sendTemplatedEmail(userEmail, 'waitlist-promoted', {
        userName,
        trainingName,
        trainingDateTime,
        trainerName,
      })
      .catch((err) =>
        this.logger.error(
          `Failed to send waitlist promoted email to ${userEmail}`,
          err,
        ),
      );
  }
}
