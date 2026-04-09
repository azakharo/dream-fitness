import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { DepositDto } from './dto/deposit.dto';
import { ReserveDto } from './dto/reserve.dto';
import { ReleaseDto } from './dto/release.dto';
import { RefundDto } from './dto/refund.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '@app/shared';
import type { PaginationParams, AuthenticatedUser } from '@app/shared';

@Controller('auth')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('balance/deposit')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async deposit(
    @Body() depositDto: DepositDto,
  ): Promise<TransactionResponseDto> {
    return this.balanceService.deposit(depositDto);
  }

  @Post('balance/reserve')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async reserve(
    @Body() reserveDto: ReserveDto,
  ): Promise<TransactionResponseDto> {
    return this.balanceService.reserve(reserveDto);
  }

  @Post('balance/release')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async release(
    @Body() releaseDto: ReleaseDto,
  ): Promise<TransactionResponseDto> {
    return this.balanceService.release(releaseDto);
  }

  @Post('balance/refund')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async refund(@Body() refundDto: RefundDto): Promise<TransactionResponseDto> {
    return this.balanceService.refund(refundDto);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: PaginationParams,
  ): Promise<TransactionListResponseDto> {
    return this.balanceService.getTransactions(user.id, filters);
  }
}
