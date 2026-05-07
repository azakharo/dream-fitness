import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  Res,
  UseGuards,
  All,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';
import { ProxyService } from './proxy.service';
import {
  RegisterDto,
  LoginDto,
  UpdateBalanceDto,
  RegisterResponseBody,
  LoginResponseBody,
  LogoutResponseBody,
  UserProfileDto,
  BalanceResponseDto,
  TransactionListResponseDto,
  TransactionResponseDto,
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
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: RegisterResponseBody,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterDto,
  ) {
    const authResponse = await this.proxyService.proxyRequestWithHeaders<{
      user: unknown;
      accessToken: string;
    }>(
      req,
      body,
      '/auth/register',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );

    this.proxyService.forwardSetCookieHeader(authResponse, res);

    return {
      user: authResponse.data.user,
      accessToken: authResponse.data.accessToken,
    };
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: LoginResponseBody,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    const authResponse = await this.proxyService.proxyRequestWithHeaders<{
      accessToken: string;
    }>(
      req,
      body,
      '/auth/login',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );

    this.proxyService.forwardSetCookieHeader(authResponse, res);

    return {
      accessToken: authResponse.data.accessToken,
    };
  }

  @Post('refresh')
  @ApiResponse({
    status: 201,
    description: 'Token refreshed successfully',
    type: LoginResponseBody,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string>)?.refreshToken;

    const body = refreshToken ? { refreshToken } : {};

    const authResponse = await this.proxyService.proxyRequestWithHeaders<{
      accessToken: string;
    }>(
      req,
      body,
      '/auth/refresh',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );

    this.proxyService.forwardSetCookieHeader(authResponse, res);

    return {
      accessToken: authResponse.data.accessToken,
    };
  }

  // Protected endpoints
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Logout successful',
    type: LogoutResponseBody,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResponse = await this.proxyService.proxyRequestWithHeaders<{
      message: string;
    }>(
      req,
      null,
      '/auth/logout',
      'POST',
      AUTH_SERVICE_URL,
      AUTH_SERVICE_DEFAULT_URL,
    );

    this.proxyService.forwardSetCookieHeader(authResponse, res);

    return {
      message: authResponse.data.message,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiResponse({
    status: 200,
    description: 'Profile updated',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved',
    type: BalanceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 201,
    description: 'Deposit successful',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 201,
    description: 'Funds reserved successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient balance' })
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
  @ApiResponse({
    status: 201,
    description: 'Funds released successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 201,
    description: 'Refund processed successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved',
    type: TransactionListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
