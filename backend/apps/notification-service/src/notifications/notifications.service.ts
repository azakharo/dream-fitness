import { Injectable } from '@nestjs/common';
import {
  NotificationRepository,
  CreateNotificationData,
  NotificationFilter,
} from './repositories/notification.repository';
import { Notification } from './entities/notification.entity';
import {
  NotificationResponseDto,
  NotificationListResponseDto,
  UnreadCountResponseDto,
} from '@app/contracts/notification';
import { NotificationNotFoundException } from '../common/exceptions';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createNotification(
    data: CreateNotificationData,
  ): Promise<Notification> {
    return this.notificationRepository.createNotification(data);
  }

  async getUserNotifications(
    userId: string,
    filter: NotificationFilter,
  ): Promise<NotificationListResponseDto> {
    const { data, total } = await this.notificationRepository.findByUserId(
      userId,
      filter,
    );

    return {
      items: data.map((notification) =>
        this.toNotificationResponseDto(notification),
      ),
      total,
      page: filter.page || 1,
      limit: filter.limit || 10,
    };
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponseDto> {
    const count = await this.notificationRepository.getUnreadCount(userId);
    return { count };
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotificationNotFoundException(id);
    }

    if (notification.userId !== userId) {
      throw new NotificationNotFoundException(id);
    }

    await this.notificationRepository.markAsRead(id);

    return this.toNotificationResponseDto({
      ...notification,
      isRead: true,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  private toNotificationResponseDto(
    notification: Notification,
  ): NotificationResponseDto {
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
