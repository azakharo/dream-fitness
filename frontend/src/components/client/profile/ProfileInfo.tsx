import type {UserProfileDto} from '@/types';
import {Button} from '@/components/ui';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';
import {Skeleton} from '@/components/ui';
import {formatDate} from '@/lib/date-utils';

interface ProfileInfoProps {
  user: UserProfileDto;
  onEdit?: () => void;
  onTopUp?: () => void;
  isLoading?: boolean;
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Мужской',
  female: 'Женский',
};

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  user,
  onEdit,
  onTopUp,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-4 h-6 w-32" />
          <Skeleton className="mt-4 h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Email:</span>{' '}
            {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Телефон:</span>{' '}
            {(user.phone as unknown as string) || 'Не указан'}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Дата рождения:</span>{' '}
            {user.birthDate
              ? formatDate(user.birthDate as unknown as string)
              : 'Не указана'}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Пол:</span>{' '}
            {user.gender ? GENDER_LABELS[user.gender] : 'Не указан'}
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-lg font-medium">
            Баланс: {user.balance.toLocaleString('ru-RU')} баллов
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={onTopUp} variant="default">
            Пополнить
          </Button>
          <Button onClick={onEdit} variant="outline">
            Редактировать
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
