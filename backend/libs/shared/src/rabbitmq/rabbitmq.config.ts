import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { EXCHANGES } from './rabbitmq.constants';

export function createRabbitMQConfig(
  serviceName: string,
): Partial<RabbitMQConfig> {
  return {
    exchanges: [
      {
        name: EXCHANGES.MAIN,
        type: 'topic',
        options: { durable: true },
      },
    ],
    queues: [
      {
        name: `${serviceName}.queue`,
        options: { durable: true },
        exchange: EXCHANGES.MAIN,
      },
    ],
    uri:
      process.env.RABBITMQ_URL ||
      'amqp://dreamfitness:dreamfitness123@localhost:5672',
    connectionInitOptions: { timeout: 30000 },
  };
}

// Preset configurations for each service
export const AUTH_SERVICE_RABBITMQ_CONFIG = createRabbitMQConfig('auth');

export const TRAINING_SERVICE_RABBITMQ_CONFIG =
  createRabbitMQConfig('training');

export const BOOKING_SERVICE_RABBITMQ_CONFIG = createRabbitMQConfig('booking');

export const NOTIFICATION_SERVICE_RABBITMQ_CONFIG =
  createRabbitMQConfig('notification');
