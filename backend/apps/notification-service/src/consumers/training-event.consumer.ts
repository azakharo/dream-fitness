import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { EventMessage } from '@app/shared';
import { EXCHANGES, QUEUES, ROUTING_KEYS } from '@app/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { NotificationType } from '@app/shared';

interface TrainingReminderEventData {
  trainingId: string;
  userId: string;
  userEmail: string;
  trainingName: string;
  trainingDateTime: string;
  trainerName: string;
}

@Injectable()
export class TrainingEventConsumer {
  private readonly logger = new Logger(TrainingEventConsumer.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.TRAINING_REMINDER,
    queue: QUEUES.NOTIFICATION_TRAINING,
  })
  async handleTrainingReminder(msg: EventMessage<TrainingReminderEventData>) {
    this.logger.log(`Received training.reminder event: ${JSON.stringify(msg)}`);

    const {
      userId,
      userEmail,
      trainingId,
      trainingName,
      trainingDateTime,
      trainerName,
    } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.TRAINING_REMINDER,
      title: 'Напоминание о тренировке',
      content: `Напоминаем о предстоящей тренировке "${trainingName}" (#${trainingId})`,
    });

    this.emailService
      .sendTemplatedEmail(userEmail, 'training-reminder', {
        trainingName,
        trainingDateTime,
        trainerName,
      })
      .catch((err) =>
        this.logger.error(
          `Failed to send training reminder email to ${userEmail}`,
          err,
        ),
      );
  }
}
