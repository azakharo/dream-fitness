import { Module } from '@nestjs/common';
import { SharedConfigModule } from '@app/shared/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BalanceModule } from './balance/balance.module';
import { EventsModule } from './events/events.module';
import { ConfigModule } from './config/config.module';
import { HttpExceptionFilter } from '@app/shared';
import { LoggingInterceptor } from '@app/shared';

@Module({
  imports: [
    SharedConfigModule,
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    BalanceModule,
    EventsModule,
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
