import type {TrainerResponseDto, TrainingResponseDto} from '@/types';
import {Badge} from '@/components/ui';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';
import {Skeleton} from '@/components/ui';
import {
  formatDateLong,
  formatTime,
  formatDuration,
  getEndTime,
} from '@/lib/date-utils';

interface TrainingDetailsProps {
  training: TrainingResponseDto;
  trainer?: TrainerResponseDto;
}

const getTrainingTypeBadgeVariant = (
  type: TrainingResponseDto['type'],
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (type) {
    case 'yoga':
      return 'default';
    case 'pilates':
      return 'secondary';
    case 'crossfit':
      return 'destructive';
    case 'boxing':
      return 'destructive';
    case 'strength':
      return 'secondary';
    case 'cardio':
      return 'default';
    case 'dance':
      return 'default';
    case 'stretching':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getTrainingTypeLabel = (type: TrainingResponseDto['type']) => {
  const labels: Record<TrainingResponseDto['type'], string> = {
    yoga: 'Йога',
    pilates: 'Пилатес',
    crossfit: 'Кроссфит',
    boxing: 'Бокс',
    strength: 'Силовая',
    cardio: 'Кардио',
    dance: 'Танцы',
    stretching: 'Стретчинг',
  };
  return labels[type] || type;
};

export const TrainingDetails: React.FC<TrainingDetailsProps> = ({
  training,
  trainer,
}) => {
  const startTime = formatTime(training.scheduledAt);
  const endTime = formatTime(
    getEndTime(training.scheduledAt, training.durationMinutes),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{training.title}</CardTitle>
          <Badge variant={getTrainingTypeBadgeVariant(training.type)}>
            {getTrainingTypeLabel(training.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>📅</span>
            <span>{formatDateLong(training.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>🕐</span>
            <span>
              {startTime} - {endTime} (
              {formatDuration(training.durationMinutes)})
            </span>
          </div>
          {trainer && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>👤</span>
              <span>{trainer.name}</span>
            </div>
          )}
          {training.trainerName && !trainer && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>👤</span>
              <span>{training.trainerName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const TrainingDetailsSkeleton: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
