import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQPublisher } from '@app/shared/rabbitmq';
import {
  TrainingCreatedEvent,
  TrainingUpdatedEvent,
  TrainingCancelledEvent,
} from '@app/contracts/training';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventsPublisher {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(private readonly rabbitMQPublisher: RabbitMQPublisher) {}

  async publishTrainingCreated(
    training: TrainingCreatedEvent['data'],
  ): Promise<void> {
    try {
      const event: TrainingCreatedEvent = {
        eventId: uuidv4(),
        eventType: 'training.created',
        timestamp: new Date().toISOString(),
        data: training,
      };
      await this.rabbitMQPublisher.publish('training.created', event);
      this.logger.log(
        `Published training.created event for training ${training.trainingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish training.created event for training ${training.trainingId}`,
        error,
      );
    }
  }

  async publishTrainingUpdated(
    training: TrainingUpdatedEvent['data'],
  ): Promise<void> {
    try {
      const event: TrainingUpdatedEvent = {
        eventId: uuidv4(),
        eventType: 'training.updated',
        timestamp: new Date().toISOString(),
        data: training,
      };
      await this.rabbitMQPublisher.publish('training.updated', event);
      this.logger.log(
        `Published training.updated event for training ${training.trainingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish training.updated event for training ${training.trainingId}`,
        error,
      );
    }
  }

  async publishTrainingCancelled(
    trainingId: string,
    reason?: string,
  ): Promise<void> {
    try {
      const event: TrainingCancelledEvent = {
        eventId: uuidv4(),
        eventType: 'training.cancelled',
        timestamp: new Date().toISOString(),
        data: {
          trainingId,
          reason,
          cancelledAt: new Date().toISOString(),
        },
      };
      await this.rabbitMQPublisher.publish('training.cancelled', event);
      this.logger.log(
        `Published training.cancelled event for training ${trainingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish training.cancelled event for training ${trainingId}`,
        error,
      );
    }
  }
}
