import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQPublisher } from '@app/shared/rabbitmq';
import { NotificationCreatedEvent } from '@app/contracts';

@Injectable()
export class EventsPublisher {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(private readonly rabbitMQPublisher: RabbitMQPublisher) {}

  async publishNotificationCreated(
    data: NotificationCreatedEvent['data'],
  ): Promise<void> {
    try {
      const event: NotificationCreatedEvent = {
        eventType: 'notification.created',
        data,
      };
      await this.rabbitMQPublisher.publish('notification.created', event);
      this.logger.log(
        `Published notification.created event for user ${data.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish notification.created event for user ${data.userId}`,
        error,
      );
    }
  }
}
