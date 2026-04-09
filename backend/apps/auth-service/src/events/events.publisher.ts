import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQPublisher } from '@app/shared/rabbitmq';
import { UserCreatedEvent } from '@app/contracts';

@Injectable()
export class EventsPublisher {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(private readonly rabbitMQPublisher: RabbitMQPublisher) {}

  async publishUserCreated(data: {
    userId: string;
    email: string;
    name: string;
    role: string;
  }): Promise<void> {
    try {
      const event: UserCreatedEvent = {
        eventType: 'user.created',
        data,
      };
      await this.rabbitMQPublisher.publish('user.created', event);
      this.logger.log(`Published user.created event for user ${data.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish user.created event for user ${data.userId}`,
        error,
      );
    }
  }

  async publishBalanceChanged(data: {
    userId: string;
    oldBalance: number;
    newBalance: number;
    amount: number;
    description: string;
  }): Promise<void> {
    try {
      const event = {
        eventType: 'user.balance_changed',
        data,
      };
      await this.rabbitMQPublisher.publish('balance.changed', event);
      this.logger.log(
        `Published balance.changed event for user ${data.userId}: ${data.oldBalance} -> ${data.newBalance}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish balance.changed event for user ${data.userId}`,
        error,
      );
    }
  }
}
