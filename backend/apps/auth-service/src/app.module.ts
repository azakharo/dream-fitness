import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BalanceModule } from './balance/balance.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [ConfigModule, AuthModule, UsersModule, BalanceModule, EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
