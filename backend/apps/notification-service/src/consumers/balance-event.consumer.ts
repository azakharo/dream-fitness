import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { BalanceChangedEvent } from '@app/contracts';
import type { EventMessage } from '@app/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@app/shared';

@Injectable()
export class BalanceEventConsumer {
  private readonly logger = new Logger(BalanceEventConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @RabbitSubscribe({
    exchange: 'dreamfitness.exchange',
    routingKey: 'balance.changed',
    queue: 'notification.service.queue',
  })
  async handleBalanceChanged(msg: EventMessage<BalanceChangedEvent['data']>) {
    this.logger.log(`Received balance.changed event: ${JSON.stringify(msg)}`);

    const { userId, newBalance, amount, description } = msg.data;

    const isIncrease = amount > 0;
    const changeText = isIncrease ? `+${amount}` : `${amount}`;
    const content = description
      ? `Баланс изменен на ${changeText}. ${description}`
      : `Баланс изменен на ${changeText}. Новый баланс: ${newBalance}`;

    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.BALANCE_CHANGE,
      title: 'Изменение баланса',
      content,
    });
  }
}
