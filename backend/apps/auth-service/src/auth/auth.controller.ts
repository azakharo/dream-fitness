import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '@app/contracts';
import { InternalGuard } from '@app/shared';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
};

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto);

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      result.tokens.refreshToken,
      cookieOptions,
    );

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and get access tokens' })
  @ApiOkResponse({
    description: 'Authentication successful',
    schema: { example: { accessToken: 'string' } },
  })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(loginDto);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, cookieOptions);

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    schema: { example: { accessToken: 'string' } },
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string>)?.[
      REFRESH_TOKEN_COOKIE_NAME
    ];

    if (!refreshToken) {
      throw new Error('Refresh token not found in cookies');
    }

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, cookieOptions);

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
  @ApiOkResponse({
    description: 'Logout successful',
    schema: { example: { message: 'Logout successful' } },
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout();

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    });

    return { message: 'Logout successful' };
  }
}
