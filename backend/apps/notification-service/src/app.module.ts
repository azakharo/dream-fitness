import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth';
import { NotificationsModule } from './notifications';
import { ConsumersModule } from './consumers';
import { EventsModule } from './events';
import { EmailModule } from './email/email.module';
import { RabbitMQModule } from '@app/shared';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    RabbitMQModule.forRoot(),
    AuthModule,
    NotificationsModule,
    ConsumersModule,
    EventsModule,
    EmailModule,
  ],
})
export class AppModule {}
