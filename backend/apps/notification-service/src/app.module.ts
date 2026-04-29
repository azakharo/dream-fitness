import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { DatabaseModule } from './database/database.module';
import { NotificationsModule } from './notifications';
import { ConsumersModule } from './consumers';
import { EventsModule } from './events';
import { EmailModule } from './email/email.module';
import { RabbitMQModule } from '@app/shared';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    RabbitMQModule.forRoot(),
    NotificationsModule,
    ConsumersModule,
    EventsModule,
    EmailModule,
    HealthModule,
  ],
})
export class AppModule {}
