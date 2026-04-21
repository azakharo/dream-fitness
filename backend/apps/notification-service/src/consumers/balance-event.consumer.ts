import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { BalanceChangedEvent } from '@app/contracts';
import type { EventMessage } from '@app/shared';
import { EXCHANGES, QUEUES, ROUTING_KEYS } from '@app/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { NotificationType } from '@app/shared';

@Injectable()
export class BalanceEventConsumer {
  private readonly logger = new Logger(BalanceEventConsumer.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.MAIN,
    routingKey: ROUTING_KEYS.BALANCE_CHANGED,
    queue: QUEUES.NOTIFICATION_BALANCE,
  })
  async handleBalanceChanged(msg: EventMessage<BalanceChangedEvent['data']>) {
    this.logger.log(`Received balance.changed event: ${JSON.stringify(msg)}`);

    const { userId, userEmail, newBalance, oldBalance, amount, description } =
      msg.data;

    const isIncrease = newBalance >= oldBalance;
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

    this.emailService
      .sendTemplatedEmail(userEmail, 'balance-change', {
        amount: changeText,
        newBalance,
        description: description || '',
      })
      .catch((err) =>
        this.logger.error(
          `Failed to send balance change email to ${userEmail}`,
          err,
        ),
      );
  }
}
