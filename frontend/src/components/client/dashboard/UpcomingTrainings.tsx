import * as React from 'react';
import type {TrainingResponseDto} from '@/types';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button, Skeleton} from '@/components/ui';

interface UpcomingTrainingsProps {
  trainings: TrainingResponseDto[];
  isLoading?: boolean;
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
};

const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const UpcomingTrainings: React.FC<UpcomingTrainingsProps> = ({
  trainings,
  isLoading = false,
}) => {
  const displayTrainings = trainings.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Предстоящие тренировки</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (trainings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Предстоящие тренировки</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">Нет предстоящих тренировок</p>
          <a href="/schedule">
            <Button variant="outline" size="sm">
              Найти тренировку
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Предстоящие тренировки</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {displayTrainings.map(training => (
          <a
            key={training.id}
            href={`/booking/${training.id}`}
            className="
              block rounded-lg border p-3 transition-colors
              hover:border-primary/50 hover:bg-muted/50
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">
                  {capitalizeFirstLetter(training.title)}
                </span>
                <span className="text-muted-foreground">
                  {' • '}
                  {formatDate(training.scheduledAt)}
                  {', '}
                  {formatTime(training.scheduledAt)}
                </span>
              </div>
            </div>
            {training.trainerName && (
              <p className="mt-1 text-sm text-muted-foreground">
                Тренер: {training.trainerName}
              </p>
            )}
          </a>
        ))}
      </CardContent>
    </Card>
  );
};
