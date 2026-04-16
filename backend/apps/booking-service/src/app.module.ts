import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { BookingCqrsModule } from './cqrs/cqrs.module';
import { ClientsModule } from './clients/clients.module';
import { EventsModule } from './events/events.module';
import { HttpExceptionFilter, LoggingInterceptor } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
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
