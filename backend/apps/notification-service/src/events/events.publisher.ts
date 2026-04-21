import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQPublisher, ROUTING_KEYS } from '@app/shared/rabbitmq';
import { NotificationCreatedEvent } from '@app/contracts';

@Injectable()
export class EventsPublisher {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(private readonly rabbitMQPublisher: RabbitMQPublisher) {}

  async publishNotificationCreated(
    data: NotificationCreatedEvent['data'],
  ): Promise<void> {
    const eventType = ROUTING_KEYS.NOTIFICATION_CREATED;
    try {
      const event: NotificationCreatedEvent = {
        eventType,
        data,
      };
      await this.rabbitMQPublisher.publish(eventType, event);
      this.logger.log(`Published ${eventType} event for user ${data.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish ${eventType} event for user ${data.userId}`,
        error,
      );
    }
  }
}
