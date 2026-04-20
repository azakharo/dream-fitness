import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingEventConsumer } from './booking-event.consumer';
import { BalanceEventConsumer } from './balance-event.consumer';
import { TrainingEventConsumer } from './training-event.consumer';

@Module({
  imports: [NotificationsModule],
  providers: [
    BookingEventConsumer,
    BalanceEventConsumer,
    TrainingEventConsumer,
  ],
  exports: [BookingEventConsumer, BalanceEventConsumer, TrainingEventConsumer],
})
export class ConsumersModule {}
