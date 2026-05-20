import { Controller } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Stage 2: Implement payment endpoints
  // Stage 3: Implement webhook endpoint
}
