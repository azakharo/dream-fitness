import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EXCHANGES } from './rabbitmq.constants';

export interface EventMessage<T = any> {
  eventType: string;
  data: T;
  timestamp: Date;
  correlationId?: string;
}

@Injectable()
export class RabbitMQPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish<T>(
    routingKey: string,
    data: T,
    correlationId?: string,
  ): Promise<void> {
    const message: EventMessage<T> = {
      eventType: routingKey,
      data,
      timestamp: new Date(),
      correlationId,
    };

    await this.amqpConnection.publish(EXCHANGES.MAIN, routingKey, message);
  }
}
