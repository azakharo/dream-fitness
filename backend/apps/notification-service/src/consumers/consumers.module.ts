import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { BookingEventConsumer } from './booking-event.consumer';
import { BalanceEventConsumer } from './balance-event.consumer';
import { TrainingEventConsumer } from './training-event.consumer';

@Module({
  imports: [NotificationsModule, EmailModule],
  providers: [
    BookingEventConsumer,
    BalanceEventConsumer,
    TrainingEventConsumer,
  ],
  exports: [BookingEventConsumer, BalanceEventConsumer, TrainingEventConsumer],
})
export class ConsumersModule {}
