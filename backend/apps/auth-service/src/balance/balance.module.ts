import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), EventsModule, UsersModule],
  providers: [TransactionRepository, BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService, TransactionRepository],
})
export class BalanceModule {}
