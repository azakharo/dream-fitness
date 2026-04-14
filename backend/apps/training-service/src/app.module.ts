import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { DatabaseModule } from './database/database.module';
import { TrainersModule } from './trainers/trainers.module';
import { TrainingsModule } from './trainings/trainings.module';
import { ScheduleModule } from './schedule/schedule.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from '@app/shared';
import { LoggingInterceptor } from '@app/shared';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    TrainersModule,
    TrainingsModule,
    ScheduleModule,
    EventsModule,
    AuthModule,
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
