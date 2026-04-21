import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { EXCHANGES, QUEUES } from './rabbitmq.constants';

interface QueueConfig {
  name: string;
  options: { durable: boolean };
  exchange: string;
}

export function createRabbitMQConfig(
  serviceName: string,
): Partial<RabbitMQConfig> {
  // Define queues based on service name
  const queueConfigs: QueueConfig[] = [];

  if (serviceName === 'notification') {
    // Notification service needs separate queues for each consumer type
    queueConfigs.push(
      {
        name: QUEUES.NOTIFICATION_BOOKING_CREATED,
        options: { durable: true },
        exchange: EXCHANGES.MAIN,
      },
      {
        name: QUEUES.NOTIFICATION_BOOKING_CANCELLED,
        options: { durable: true },
        exchange: EXCHANGES.MAIN,
      },
      {
        name: QUEUES.NOTIFICATION_WAITLIST_JOINED,
        options: { durable: true },
        exchange: EXCHANGES.MAIN,
      },
      {
        name: QUEUES.NOTIFICATION_WAITLIST_PROMOTED,
        options: { durable: true },
        exchange: EXCHANGES.MAIN,
      },
      {
        name: QUEUES.NOTIFICATION_BALANCE,
        options: { durable: true },
        exchange: EXCHANGES.MAIN,
      },
      {
        name: QUEUES.NOTIFICATION_TRAINING,
        options: { durable: true },
        exchange: EXCHANGES.MAIN,
      },
    );
  } else {
    queueConfigs.push({
      name: `${serviceName}.queue`,
      options: { durable: true },
      exchange: EXCHANGES.MAIN,
    });
  }

  return {
    exchanges: [
      {
        name: EXCHANGES.MAIN,
        type: 'topic',
        options: { durable: true },
      },
    ],
    queues: queueConfigs,
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
