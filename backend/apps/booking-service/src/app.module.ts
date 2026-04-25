import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './database/database.module';
import { BookingsModule } from './bookings/bookings.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { BookingCqrsModule } from './cqrs/cqrs.module';
import { ClientsModule } from './clients/clients.module';
import { EventsModule } from './events/events.module';
import { ConfigModule } from './config/config.module';
import { HttpExceptionFilter, LoggingInterceptor } from '@app/shared';

@Module({
  imports: [
    ConfigModule,
    CqrsModule.forRoot(),
    DatabaseModule,
    ClientsModule,
    EventsModule,
    BookingsModule,
    WaitlistModule,
    BookingCqrsModule,
  ],
  controllers: [],
  providers: [
    { provide: 'APP_FILTER', useClass: HttpExceptionFilter },
    { provide: 'APP_INTERCEPTOR', useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
