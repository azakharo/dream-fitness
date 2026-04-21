import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQPublisher } from '@app/shared/rabbitmq';
import { ROUTING_KEYS } from '@app/shared/rabbitmq';

@Injectable()
export class EventsPublisher {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(private readonly rabbitMQPublisher: RabbitMQPublisher) {}

  async publishBookingCreated(data: {
    bookingId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    bookedAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  }): Promise<void> {
    try {
      await this.rabbitMQPublisher.publish(ROUTING_KEYS.BOOKING_CREATED, data);
      this.logger.log(
        `Published booking.created event for booking ${data.bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish booking.created event for booking ${data.bookingId}`,
        error,
      );
    }
  }

  async publishBookingCancelled(data: {
    bookingId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    reason?: string;
    cancelledAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  }): Promise<void> {
    try {
      await this.rabbitMQPublisher.publish(
        ROUTING_KEYS.BOOKING_CANCELLED,
        data,
      );
      this.logger.log(
        `Published booking.cancelled event for booking ${data.bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish booking.cancelled event for booking ${data.bookingId}`,
        error,
      );
    }
  }

  async publishWaitlistJoined(data: {
    waitlistId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    position: number;
    joinedAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  }): Promise<void> {
    try {
      await this.rabbitMQPublisher.publish(ROUTING_KEYS.WAITLIST_JOINED, data);
      this.logger.log(
        `Published waitlist.joined event for waitlist ${data.waitlistId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish waitlist.joined event for waitlist ${data.waitlistId}`,
        error,
      );
    }
  }

  async publishWaitlistPromoted(data: {
    waitlistId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    promotedAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  }): Promise<void> {
    try {
      await this.rabbitMQPublisher.publish(
        ROUTING_KEYS.WAITLIST_PROMOTED,
        data,
      );
      this.logger.log(
        `Published waitlist.promoted event for waitlist ${data.waitlistId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish waitlist.promoted event for waitlist ${data.waitlistId}`,
        error,
      );
    }
  }
}
