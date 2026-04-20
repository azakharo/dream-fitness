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
import { NotificationType } from '@app/shared';

@Injectable()
export class BookingEventConsumer {
  private readonly logger = new Logger(BookingEventConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @RabbitSubscribe({
    exchange: 'dreamfitness.exchange',
    routingKey: 'booking.created',
    queue: 'notification.service.queue',
  })
  async handleBookingCreated(msg: EventMessage<BookingCreatedEvent['data']>) {
    this.logger.log(`Received booking.created event: ${JSON.stringify(msg)}`);

    const { userId, trainingId } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.BOOKING_CONFIRMATION,
      title: 'Запись на тренировку подтверждена',
      content: `Вы успешно записаны на тренировку #${trainingId}`,
    });
  }

  @RabbitSubscribe({
    exchange: 'dreamfitness.exchange',
    routingKey: 'booking.cancelled',
    queue: 'notification.service.queue',
  })
  async handleBookingCancelled(
    msg: EventMessage<BookingCancelledEvent['data']>,
  ) {
    this.logger.log(`Received booking.cancelled event: ${JSON.stringify(msg)}`);

    const { userId, trainingId, reason } = msg.data;

    const content = reason
      ? `Запись на тренировку #${trainingId} отменена: ${reason}`
      : `Ваша запись на тренировку #${trainingId} отменена`;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.BOOKING_CANCELLATION,
      title: 'Запись на тренировку отменена',
      content,
    });
  }

  @RabbitSubscribe({
    exchange: 'dreamfitness.exchange',
    routingKey: 'waitlist.joined',
    queue: 'notification.service.queue',
  })
  async handleWaitlistJoined(msg: EventMessage<WaitlistJoinedEvent['data']>) {
    this.logger.log(`Received waitlist.joined event: ${JSON.stringify(msg)}`);

    const { userId, trainingId, position } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.WAITLIST_JOINED,
      title: 'Вы добавлены в лист ожидания',
      content: `Вы добавлены в лист ожидания на тренировку #${trainingId}. Ваша позиция: ${position}`,
    });
  }

  @RabbitSubscribe({
    exchange: 'dreamfitness.exchange',
    routingKey: 'waitlist.promoted',
    queue: 'notification.service.queue',
  })
  async handleWaitlistPromoted(
    msg: EventMessage<WaitlistPromotedEvent['data']>,
  ) {
    this.logger.log(`Received waitlist.promoted event: ${JSON.stringify(msg)}`);

    const { userId, trainingId } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.WAITLIST_PROMOTED,
      title: 'Место освободилось! Вы записаны',
      content: `Поздравляем! Место на тренировке #${trainingId} освободилось, и вы были записаны автоматически`,
    });
  }
}
