import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { TinkoffClientService } from './tinkoff-client.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly tinkoffClient: TinkoffClientService,
  ) {}

  // Stage 2: Implement payment initialization
  // Stage 3: Implement webhook handling
}
