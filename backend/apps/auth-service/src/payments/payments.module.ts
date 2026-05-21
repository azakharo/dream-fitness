import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { TinkoffClientService } from './tinkoff-client.service';
import { MockTinkoffClientService } from './mock-tinkoff-client.service';
import { ITinkoffClient } from './interfaces/tinkoff-client.interface';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BalanceModule } from '../balance/balance.module';

const TINKOFF_CLIENT_PROVIDER = {
  provide: 'TINKOFF_CLIENT',
  useFactory: (
    httpService: HttpService,
    configService: ConfigService,
  ): ITinkoffClient => {
    const logger = new Logger('TinkoffClientFactory');
    const isMock = configService.get<string>('TINKOFF_MOCK') === 'true';

    if (isMock) {
      logger.log('Using MockTinkoffClientService (TINKOFF_MOCK=true)');
      return new MockTinkoffClientService();
    }

    logger.log('Using TinkoffClientService (production mode)');
    return new TinkoffClientService(httpService, configService);
  },
  inject: [HttpService, ConfigService],
};

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), HttpModule, BalanceModule],
  providers: [PaymentRepository, TINKOFF_CLIENT_PROVIDER, PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService, PaymentRepository],
})
export class PaymentsModule {}
