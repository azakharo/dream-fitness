import React from 'react';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Lock, User} from 'lucide-react';

import {Badge} from '@/components/ui/Badge';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Skeleton} from '@/components/ui/Skeleton';
import type {UserDto} from '@/types';

interface UserInfoCardProps {
  user: UserDto;
  isLoading?: boolean;
  onBlock?: () => void;
  onUnblock?: () => void;
}

const formatPhone = (phone: UserDto['phone']): string => {
  if (!phone || typeof phone !== 'string') return '—';
  return phone;
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString || typeof dateString !== 'string') return '—';
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', {locale: ru});
  } catch {
    return '—';
  }
};

const formatBalance = (balance: number): string => {
  return `${balance.toLocaleString('ru-RU')} баллов`;
};

const getStatusBadgeVariant = (
  status: UserDto['status'],
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  return status === 'active' ? 'default' : 'destructive';
};

const getStatusLabel = (status: UserDto['status']): string => {
  return status === 'active' ? 'Активен' : 'Заблокирован';
};

const getGenderLabel = (gender: UserDto['gender']): string => {
  if (!gender) return '—';
  return gender === 'male' ? 'Мужской' : 'Женский';
};

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user,
  isLoading = false,
  onBlock,
  onUnblock,
}) => {
  const isBlocked = user.status === 'blocked';

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="
                flex size-12 items-center justify-center rounded-full bg-muted
              "
            >
              <User className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {getStatusLabel(user.status)}
              </Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={isBlocked ? onUnblock : onBlock}
            className={`
              inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm
              font-medium transition-colors
              ${
                isBlocked
                  ? `
                    bg-green-100 text-green-700
                    hover:bg-green-200
                    dark:bg-green-900/30 dark:text-green-400
                  `
                  : `
                    bg-destructive/10 text-destructive
                    hover:bg-destructive/20
                  `
              }
            `}
          >
            <Lock className="size-4" />
            {isBlocked ? 'Разблокировать' : 'Заблокировать'}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Телефон:</span>
            <span className="font-medium">{formatPhone(user.phone)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Дата рождения:</span>
            <span className="font-medium">{formatDate(user.birthDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Пол:</span>
            <span className="font-medium">{getGenderLabel(user.gender)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Баланс:</span>
            <span className="font-medium">{formatBalance(user.balance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Статус:</span>
            <span className="font-medium">{getStatusLabel(user.status)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Дата регистрации:</span>
            <span className="font-medium">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
