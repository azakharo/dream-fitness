import React from 'react';
import {Clock, User, Coins, Users} from 'lucide-react';
import {Link} from '@tanstack/react-router';
import {Card, CardContent} from '@/components/ui';
import {Badge} from '@/components/ui';
import {TrainingTypeIcon} from './TrainingTypeIcon';
import type {TrainingResponseDto} from '@/types';
import {formatTime, getEndTime, parseApiDate} from '@/lib/date-utils';

interface TrainingCardProps {
  training: TrainingResponseDto;
  onClick?: () => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({
  training,
  onClick,
}) => {
  const startTime = parseApiDate(training.scheduledAt);
  const endTime = getEndTime(training.scheduledAt, training.durationMinutes);

  const spotsRemaining = training.availableSlots;
  const isAlmostFull = spotsRemaining <= 3;
  const isFull = spotsRemaining === 0;

  return (
    <Link
      to="/booking/$id"
      params={{id: training.id}}
      className="block"
      onClick={onClick}
    >
      <Card
        className={`
          cursor-pointer overflow-hidden transition-all duration-200
          hover:-translate-y-1 hover:border-[oklch(0.68_0.22_130)]
          hover:shadow-md
        `}
      >
        <div
          className="
            flex h-[100px] items-center justify-center bg-linear-to-br
            from-[oklch(0.96_0.05_130)] to-[oklch(0.94_0.08_130)]
          "
        >
          <div className="relative">
            <Badge
              variant="secondary"
              className="absolute -top-8 left-1/2 -translate-x-1/2 capitalize"
            >
              {training.type}
            </Badge>
            <TrainingTypeIcon
              type={training.type}
              size="lg"
              className="text-[oklch(0.68_0.22_130)]"
            />
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="mb-3 text-lg font-medium text-[oklch(0.15_0.02_130)]">
            {training.title}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>
                {formatTime(startTime)} - {formatTime(endTime)} (
                {training.durationMinutes} мин)
              </span>
            </div>

            {training.trainerName && (
              <div className="flex items-center gap-2">
                <User className="size-4" />
                <span>{training.trainerName}</span>
              </div>
            )}
          </div>

          <div
            className="
              mt-3 flex items-center justify-between border-t
              border-[oklch(0.90_0.01_130)] pt-3
              dark:border-[oklch(0.30_0.02_130)]
            "
          >
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              {isFull ? (
                <span className="text-sm text-destructive">Мест нет</span>
              ) : (
                <span
                  className={`
                    text-sm
                    ${isAlmostFull ? 'text-orange-500' : ''}
                  `}
                >
                  {spotsRemaining} из {training.capacity}
                </span>
              )}
            </div>

            <div
              className="
                flex items-center gap-1 font-medium text-[oklch(0.35_0.12_130)]
              "
            >
              <Coins className="size-4" />
              <span>{training.price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
