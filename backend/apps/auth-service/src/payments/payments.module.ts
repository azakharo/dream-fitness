import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { TinkoffClientService } from './tinkoff-client.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), HttpModule],
  providers: [PaymentRepository, TinkoffClientService, PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService, PaymentRepository, TinkoffClientService],
})
export class PaymentsModule {}
