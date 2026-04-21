import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import {
  NotificationType,
  PaginationParams,
  normalizePaginationParams,
} from '@app/shared';

export interface NotificationFilter extends PaginationParams {
  isRead?: boolean;
  type?: NotificationType;
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
}

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  async findByUserId(
    userId: string,
    filter?: NotificationFilter,
  ): Promise<{ data: Notification[]; total: number }> {
    const { limit, skip } = normalizePaginationParams(filter || {});

    const queryBuilder = this.createQueryBuilder('notification');

    queryBuilder.where('notification.userId = :userId', { userId });

    if (filter?.isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', {
        isRead: filter.isRead,
      });
    }

    if (filter?.type) {
      queryBuilder.andWhere('notification.type = :type', {
        type: filter.type,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: string): Promise<Notification | undefined> {
    const notification = await this.findOne({
      where: { id },
      select: [
        'id',
        'userId',
        'type',
        'title',
        'content',
        'isRead',
        'createdAt',
      ],
    });
    return notification ?? undefined;
  }

  async markAsRead(id: string): Promise<void> {
    await this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.update({ userId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async createNotification(
    data: CreateNotificationData,
  ): Promise<Notification> {
    const notification = this.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      isRead: false,
    });
    return this.save(notification);
  }
}
