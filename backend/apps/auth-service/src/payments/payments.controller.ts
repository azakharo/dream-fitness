import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InternalGuard, CurrentUser } from '@app/shared';
import type { AuthenticatedUser } from '@app/shared';
import { PaymentsService } from './payments.service';
import {
  InitPaymentDto,
  InitPaymentResponseDto,
  PaymentStatusResponseDto,
  PaymentHistoryResponseDto,
  GetPaymentHistoryQueryDto,
  TinkoffWebhookDto,
  TinkoffWebhookResponseDto,
} from '@app/contracts';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Tinkoff Kassa webhook' })
  @ApiOkResponse({ type: TinkoffWebhookResponseDto })
  async handleWebhook(
    @Body() dto: TinkoffWebhookDto,
  ): Promise<TinkoffWebhookResponseDto> {
    return this.paymentsService.handleWebhook(dto);
  }

  @Post('init')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Initialize a new payment' })
  @ApiCreatedResponse({ type: InitPaymentResponseDto })
  async initPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitPaymentDto,
  ): Promise<InitPaymentResponseDto> {
    return this.paymentsService.initPayment(user.id, dto);
  }

  @Get(':id/status')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get payment status by ID' })
  @ApiOkResponse({ type: PaymentStatusResponseDto })
  async getPaymentStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') paymentId: string,
  ): Promise<PaymentStatusResponseDto> {
    return this.paymentsService.getPaymentStatus(user.id, paymentId);
  }

  @Get()
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiOkResponse({ type: PaymentHistoryResponseDto })
  async getPaymentHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetPaymentHistoryQueryDto,
  ): Promise<PaymentHistoryResponseDto> {
    return this.paymentsService.getPaymentHistory(
      user.id,
      query.page,
      query.limit,
    );
  }
}
