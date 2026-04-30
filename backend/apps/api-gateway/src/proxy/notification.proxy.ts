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
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';
import { ProxyService } from './proxy.service';
import {
  NotificationListResponseDto,
  UnreadCountResponseDto,
  NotificationDto,
} from '@app/contracts/notification';

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
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved',
    type: NotificationListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved',
    type: NotificationDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
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
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
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
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: { type: 'object', properties: { updated: { type: 'number' } } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Notification deleted',
    schema: { type: 'object', properties: { deleted: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
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
  @ApiResponse({
    status: 200,
    description: 'All notifications deleted',
    schema: { type: 'object', properties: { deleted: { type: 'number' } } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
