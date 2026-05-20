import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProxyService } from './proxy.service';
import {
  InitPaymentDto,
  InitPaymentResponseDto,
  PaymentStatusResponseDto,
  PaymentHistoryResponseDto,
  GetPaymentHistoryQueryDto,
} from '@app/contracts';

const AUTH_SERVICE_URL = 'AUTH_SERVICE_URL';
const AUTH_SERVICE_DEFAULT_URL = 'http://localhost:3001';

@ApiTags('Payments')
@Controller('api/payments')
export class PaymentProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize a new payment' })
  @ApiCreatedResponse({ type: InitPaymentResponseDto })
  @ApiBody({ type: InitPaymentDto })
  async initPayment(
    @Req() req: RequestWithUser,
    @Body() body: InitPaymentDto,
  ): Promise<InitPaymentResponseDto> {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/payments/init',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status by ID' })
  @ApiOkResponse({ type: PaymentStatusResponseDto })
  async getPaymentStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<PaymentStatusResponseDto> {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/payments/${id}/status`,
      'GET',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiOkResponse({ type: PaymentHistoryResponseDto })
  async getPaymentHistory(
    @Req() req: RequestWithUser,
    // Needed for Swagger documentation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query() _query: GetPaymentHistoryQueryDto,
  ): Promise<PaymentHistoryResponseDto> {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/payments',
      'GET',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }
}
