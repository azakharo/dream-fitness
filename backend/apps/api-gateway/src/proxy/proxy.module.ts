import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '../config';
import { AuthProxyController } from './auth.proxy';
import { TrainingProxyController } from './training.proxy';
import { BookingProxyController } from './booking.proxy';
import { NotificationProxyController } from './notification.proxy';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [
    AuthProxyController,
    TrainingProxyController,
    BookingProxyController,
    NotificationProxyController,
  ],
})
export class ProxyModule {}
