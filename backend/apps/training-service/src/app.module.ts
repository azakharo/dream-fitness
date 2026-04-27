import { Module } from '@nestjs/common';
import { SharedConfigModule } from '@app/shared/config';
import { DatabaseModule } from './database/database.module';
import { TrainersModule } from './trainers/trainers.module';
import { TrainingsModule } from './trainings/trainings.module';
import { ScheduleModule } from './schedule/schedule.module';
import { EventsModule } from './events/events.module';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { HttpExceptionFilter } from '@app/shared';
import { LoggingInterceptor } from '@app/shared';

@Module({
  imports: [
    SharedConfigModule,
    ConfigModule,
    DatabaseModule,
    TrainersModule,
    TrainingsModule,
    ScheduleModule,
    EventsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
