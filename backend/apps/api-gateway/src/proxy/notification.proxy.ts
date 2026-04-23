import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
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
import { ApiExcludeEndpoint } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Controller('api')
export class NotificationProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Notifications endpoints
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  getNotifications(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('read') read?: string,
    @Query('type') type?: string,
  ) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (read !== undefined) queryParams.append('read', read);
    if (type) queryParams.append('type', type);
    const query = queryParams.toString();
    return this.proxyRequest(
      req,
      null,
      `/notifications${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  @Get('notifications/unread-count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/notifications/unread-count', 'GET');
  }

  @Get('notifications/:id')
  @UseGuards(JwtAuthGuard)
  getNotificationById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/notifications/${id}`, 'GET');
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/notifications/${id}/read`, 'PATCH');
  }

  @Patch('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@Req() req: RequestWithUser) {
    return this.proxyRequest(req, null, '/notifications/read-all', 'PATCH');
  }

  @Delete('notifications/:id')
  @UseGuards(JwtAuthGuard)
  deleteNotification(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/notifications/${id}`, 'DELETE');
  }

  @Delete('notifications')
  @UseGuards(JwtAuthGuard)
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
