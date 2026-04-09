import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { UserRepository } from '../users/repositories/user.repository';
import { User } from '../users/entities/user.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionRepository,
      User,
      UserRepository,
    ]),
    EventsModule,
  ],
  providers: [TransactionRepository, UserRepository, BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService, TransactionRepository],
})
export class BalanceModule {}
