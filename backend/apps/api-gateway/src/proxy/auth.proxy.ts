import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  All,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';
import { ProxyService } from './proxy.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  UpdateBalanceDto,
} from '@app/contracts/auth';

const AUTH_SERVICE_URL = 'AUTH_SERVICE_URL';
const AUTH_SERVICE_DEFAULT_URL = 'http://localhost:3001';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Public endpoints (no auth)
  @Post('register')
  @ApiBody({ type: RegisterDto })
  register(@Req() req: Request, @Body() body: RegisterDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/register',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Req() req: Request, @Body() body: LoginDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/login',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  refresh(@Req() req: Request, @Body() body: RefreshTokenDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/refresh',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  // Protected endpoints
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/auth/logout',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/auth/me',
      'GET',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: RegisterDto })
  updateProfile(@Req() req: RequestWithUser, @Body() body: RegisterDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/me',
      'PATCH',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getBalance(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/auth/balance',
      'GET',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Post('balance/deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateBalanceDto })
  deposit(@Req() req: RequestWithUser, @Body() body: UpdateBalanceDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/balance/deposit',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Post('balance/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateBalanceDto })
  reserve(@Req() req: RequestWithUser, @Body() body: UpdateBalanceDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/balance/reserve',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Post('balance/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateBalanceDto })
  release(@Req() req: RequestWithUser, @Body() body: UpdateBalanceDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/balance/release',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Post('balance/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateBalanceDto })
  refund(@Req() req: RequestWithUser, @Body() body: UpdateBalanceDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/auth/balance/refund',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTransactions(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/auth/transactions',
      'GET',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }

  // Catch-all for any other auth routes
  @All('*path')
  @ApiExcludeEndpoint()
  catchAll(@Req() req: Request) {
    const path = req.path.replace(/^\/api\/auth/, '');
    return this.proxyService.proxyRequest(
      req,
      req.body,
      `/auth${path}`,
      req.method,
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );
  }
}
