import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { EventMessage } from '@app/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@app/shared';

interface TrainingReminderEventData {
  trainingId: string;
  userId: string;
  trainingName: string;
  trainingDateTime: string;
  trainerName: string;
}

@Injectable()
export class TrainingEventConsumer {
  private readonly logger = new Logger(TrainingEventConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @RabbitSubscribe({
    exchange: 'dreamfitness.exchange',
    routingKey: 'training.reminder',
    queue: 'notification.service.queue',
  })
  async handleTrainingReminder(msg: EventMessage<TrainingReminderEventData>) {
    this.logger.log(`Received training.reminder event: ${JSON.stringify(msg)}`);

    const { userId, trainingId, trainingName } = msg.data;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.TRAINING_REMINDER,
      title: 'Напоминание о тренировке',
      content: `Напоминаем о предстоящей тренировке "${trainingName}" (#${trainingId})`,
    });
  }
}
