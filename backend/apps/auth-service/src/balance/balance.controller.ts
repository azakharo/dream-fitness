import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { InternalGuard } from '@app/shared';
import { BalanceService } from './balance.service';
import { DepositDto } from './dto/deposit.dto';
import { ReserveDto } from './dto/reserve.dto';
import { ReleaseDto } from './dto/release.dto';
import { RefundDto } from './dto/refund.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { CurrentUser } from '@app/shared';
import type { PaginationParams, AuthenticatedUser } from '@app/shared';

@ApiTags('Balance')
@Controller('auth')
@UseGuards(InternalGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('balance/deposit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deposit funds to user balance' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: DepositDto })
  async deposit(
    @Body() depositDto: DepositDto,
  ): Promise<TransactionResponseDto> {
    return this.balanceService.deposit(depositDto);
  }

  @Post('balance/reserve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve funds for a booking' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: ReserveDto })
  async reserve(
    @Body() reserveDto: ReserveDto,
  ): Promise<TransactionResponseDto> {
    return this.balanceService.reserve(reserveDto);
  }

  @Post('balance/release')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release reserved funds back to balance' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: ReleaseDto })
  async release(
    @Body() releaseDto: ReleaseDto,
  ): Promise<TransactionResponseDto> {
    return this.balanceService.release(releaseDto);
  }

  @Post('balance/refund')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund funds to user balance' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: RefundDto })
  async refund(@Body() refundDto: RefundDto): Promise<TransactionResponseDto> {
    return this.balanceService.refund(refundDto);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiOkResponse({ type: TransactionListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: PaginationParams,
  ): Promise<TransactionListResponseDto> {
    return this.balanceService.getTransactions(user.id, filters);
  }
}
