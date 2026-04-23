import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Req,
  UseGuards,
  All,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { ConfigService } from '../config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Controller('api/auth')
export class AuthProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Public endpoints (no auth)
  @Post('register')
  register(@Req() req: Request, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/register', 'POST');
  }

  @Post('login')
  login(@Req() req: Request, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/login', 'POST');
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/refresh', 'POST');
  }

  // Protected endpoints
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/auth/logout', 'POST');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/auth/me', 'GET');
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/me', 'PATCH');
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  getBalance(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/auth/balance', 'GET');
  }

  @Post('balance/deposit')
  @UseGuards(JwtAuthGuard)
  deposit(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/deposit', 'POST');
  }

  @Post('balance/reserve')
  @UseGuards(JwtAuthGuard)
  reserve(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/reserve', 'POST');
  }

  @Post('balance/release')
  @UseGuards(JwtAuthGuard)
  release(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/release', 'POST');
  }

  @Post('balance/refund')
  @UseGuards(JwtAuthGuard)
  refund(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/refund', 'POST');
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  getTransactions(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    const query = queryParams.toString();
    return this.proxyRequest(
      req,
      null,
      `/auth/transactions${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  // Catch-all for any other auth routes
  @All('*path')
  catchAll(@Req() req: Request) {
    const path = req.path.replace(/^\/api\/auth/, '');
    return this.proxyRequest(req, req.body, `/auth${path}`, req.method);
  }

  private async proxyRequest(
    req: Request,
    body: unknown,
    path: string,
    method = 'GET',
  ): Promise<unknown> {
    const baseUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:3001';
    const url = `${baseUrl}${path}`;

    const headers = this.buildHeaders(req as RequestWithUser);

    const response = await this.httpService.axiosRef.request({
      method,
      url,
      headers,
      data: body,
      params: req.query,
    });
    return response.data;
  }

  private buildHeaders(req: RequestWithUser): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (req.user) {
      headers['X-User-Id'] = req.user.id;
      headers['X-User-Role'] = req.user.role;
    }

    return headers;
  }
}
