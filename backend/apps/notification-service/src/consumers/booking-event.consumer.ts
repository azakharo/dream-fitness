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
import { NotificationType, EXCHANGES, ROUTING_KEYS, QUEUES } from '@app/shared';

@Injectable()
export class BookingEventConsumer {
  private readonly logger = new Logger(BookingEventConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.BOOKING_CREATED,
    queue: QUEUES.NOTIFICATION_SERVICE,
  })
  async handleBookingCreated(msg: EventMessage<BookingCreatedEvent['data']>) {
    this.logger.log(`Received booking.created event: ${JSON.stringify(msg)}`);

    const { userId, trainingName, trainingDateTime, trainerName } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.BOOKING_CONFIRMATION,
      title: 'Запись на тренировку подтверждена',
      content: `Вы успешно записаны на тренировку "${trainingName}". ${trainingDateTime}, тренер: ${trainerName}`,
    });
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.BOOKING_CANCELLED,
    queue: QUEUES.NOTIFICATION_SERVICE,
  })
  async handleBookingCancelled(
    msg: EventMessage<BookingCancelledEvent['data']>,
  ) {
    this.logger.log(`Received booking.cancelled event: ${JSON.stringify(msg)}`);

    const { userId, trainingName, trainingDateTime, trainerName, reason } =
      msg.data;

    const content = reason
      ? `Запись на тренировку "${trainingName}" отменена: ${reason}. ${trainingDateTime}, тренер: ${trainerName}`
      : `Ваша запись на тренировку "${trainingName}" отменена. ${trainingDateTime}, тренер: ${trainerName}`;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.BOOKING_CANCELLATION,
      title: 'Запись на тренировку отменена',
      content,
    });
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.WAITLIST_JOINED,
    queue: QUEUES.NOTIFICATION_SERVICE,
  })
  async handleWaitlistJoined(msg: EventMessage<WaitlistJoinedEvent['data']>) {
    this.logger.log(`Received waitlist.joined event: ${JSON.stringify(msg)}`);

    const { userId, trainingName, trainingDateTime, trainerName, position } =
      msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.WAITLIST_JOINED,
      title: 'Вы добавлены в лист ожидания',
      content: `Вы добавлены в лист ожидания на тренировку "${trainingName}". ${trainingDateTime}, тренер: ${trainerName}. Ваша позиция: ${position}`,
    });
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.WAITLIST_PROMOTED,
    queue: QUEUES.NOTIFICATION_SERVICE,
  })
  async handleWaitlistPromoted(
    msg: EventMessage<WaitlistPromotedEvent['data']>,
  ) {
    this.logger.log(`Received waitlist.promoted event: ${JSON.stringify(msg)}`);

    const { userId, trainingName, trainingDateTime, trainerName } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.WAITLIST_PROMOTED,
      title: 'Место освободилось! Вы записаны',
      content: `Поздравляем! Место на тренировке "${trainingName}" освободилось, и вы были записаны автоматически. ${trainingDateTime}, тренер: ${trainerName}`,
    });
  }
}
