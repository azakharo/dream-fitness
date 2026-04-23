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
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { ConfigService } from '../config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@ApiTags('Auth')
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
  @ApiBearerAuth()
  logout(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/auth/logout', 'POST');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/auth/me', 'GET');
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/me', 'PATCH');
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getBalance(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/auth/balance', 'GET');
  }

  @Post('balance/deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deposit(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/deposit', 'POST');
  }

  @Post('balance/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reserve(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/reserve', 'POST');
  }

  @Post('balance/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  release(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/release', 'POST');
  }

  @Post('balance/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  refund(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/auth/balance/refund', 'POST');
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTransactions(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/auth/transactions', 'GET');
  }

  // Catch-all for any other auth routes
  @All('*path')
  @ApiExcludeEndpoint()
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

    // Only include data property if body is not null/undefined,
    // otherwise axios sends "null" as body which causes JSON parsing errors
    const requestConfig: {
      method: string;
      url: string;
      headers: Record<string, string>;
      data?: unknown;
      params: typeof req.query;
    } = {
      method,
      url,
      headers,
      params: req.query,
    };

    if (body !== null && body !== undefined) {
      requestConfig.data = body;
    }

    const response = await this.httpService.axiosRef.request(requestConfig);
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
