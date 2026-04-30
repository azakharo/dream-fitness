import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { InternalGuard, InternalUser } from '@app/shared';
import { NotificationsService } from './notifications.service';
import {
  NotificationResponseDto,
  NotificationListResponseDto,
  UnreadCountResponseDto,
} from '@app/contracts/notification';
import { NotificationFilterDto, CreateNotificationAdminDto } from './dto';
import { NotificationFilter } from './repositories/notification.repository';
import { AdminGuard } from '../auth/guards';

interface AuthenticatedUser {
  id: string;
  role?: string;
}

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(InternalGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a notification (admin only)' })
  @ApiCreatedResponse({ type: NotificationResponseDto })
  async create(
    @Body() dto: CreateNotificationAdminDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.createNotification({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
    });
    return this.toNotificationResponseDto(notification);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications with filters' })
  @ApiOkResponse({ type: NotificationListResponseDto })
  async findAll(
    @InternalUser() user: AuthenticatedUser,
    @Query() filters: NotificationFilterDto,
  ): Promise<NotificationListResponseDto> {
    const filter: NotificationFilter = {
      page: filters.page,
      limit: filters.limit,
      isRead: filters.isRead,
      type: filters.type,
    };
    return this.notificationsService.getUserNotifications(user.id, filter);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiOkResponse({ type: UnreadCountResponseDto })
  async getUnreadCount(
    @InternalUser() user: AuthenticatedUser,
  ): Promise<UnreadCountResponseDto> {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiOkResponse({ type: NotificationResponseDto })
  async markAsRead(
    @Param('id') id: string,
    @InternalUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiOkResponse({ description: 'All notifications marked as read' })
  async markAllAsRead(@InternalUser() user: AuthenticatedUser): Promise<void> {
    await this.notificationsService.markAllAsRead(user.id);
  }

  private toNotificationResponseDto(notification: {
    id: string;
    userId: string;
    type: import('@app/shared').NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
  }): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
