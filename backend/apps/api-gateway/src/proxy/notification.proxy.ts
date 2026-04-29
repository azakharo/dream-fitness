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
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';
import { ProxyService } from './proxy.service';

const NOTIFICATION_SERVICE_URL = 'NOTIFICATION_SERVICE_URL';
const NOTIFICATION_SERVICE_DEFAULT_URL = 'http://localhost:3004';

@ApiTags('Notifications')
@Controller('api')
export class NotificationProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Notifications endpoints
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getNotifications(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/notifications',
      'GET',
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }

  @Get('notifications/unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUnreadCount(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/notifications/unread-count',
      'GET',
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }

  @Get('notifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getNotificationById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/notifications/${id}`,
      'GET',
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAsRead(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/notifications/${id}/read`,
      'PATCH',
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }

  @Patch('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAllAsRead(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/notifications/read-all',
      'PATCH',
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }

  @Delete('notifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteNotification(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/notifications/${id}`,
      'DELETE',
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }

  @Delete('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteAllNotifications(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/notifications',
      'DELETE',
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }

  // Catch-all for notification routes
  @All('notifications/*path')
  @ApiExcludeEndpoint()
  catchAllNotifications(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyService.proxyRequest(
      req,
      req.body,
      path,
      req.method,
      NOTIFICATION_SERVICE_URL,
      NOTIFICATION_SERVICE_DEFAULT_URL,
    );
  }
}
