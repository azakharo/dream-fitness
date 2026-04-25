import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  All,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { ConfigService } from '../config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';

@ApiTags('Notifications')
@Controller('api')
export class NotificationProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Notifications endpoints
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getNotifications(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/notifications', 'GET');
  }

  @Get('notifications/unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUnreadCount(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/notifications/unread-count', 'GET');
  }

  @Get('notifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getNotificationById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/notifications/${id}`, 'GET');
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAsRead(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/notifications/${id}/read`, 'PATCH');
  }

  @Patch('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAllAsRead(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/notifications/read-all', 'PATCH');
  }

  @Delete('notifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteNotification(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/notifications/${id}`, 'DELETE');
  }

  @Delete('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteAllNotifications(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/notifications', 'DELETE');
  }

  // Catch-all for notification routes
  @All('notifications/*path')
  @ApiExcludeEndpoint()
  catchAllNotifications(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyRequest(req, req.body, path, req.method);
  }

  private async proxyRequest(
    req: Request,
    body: unknown,
    path: string,
    method = 'GET',
  ): Promise<unknown> {
    const baseUrl =
      this.configService.get<string>('NOTIFICATION_SERVICE_URL') ||
      'http://localhost:3004';
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
