import React from 'react';
import {Clock, User, Coins, Users} from 'lucide-react';
import {Link} from '@tanstack/react-router';
import {Card, CardContent} from '@/components/ui';
import {Badge} from '@/components/ui';
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

  const formatPrice = (price: number): string => {
    return `${price} баллов`;
  };

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
        className="
          cursor-pointer transition-all
          hover:shadow-md hover:ring-2 hover:ring-primary/20
        "
      >
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-medium">{training.title}</h3>
            <Badge variant="secondary" className="mt-1 capitalize">
              {training.type}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>
                {formatTime(startTime)} - {formatTime(endTime)}
              </span>
            </div>

            {training.trainerName && (
              <div className="flex items-center gap-2">
                <User className="size-4" />
                <span>{training.trainerName}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Coins className="size-4" />
              <span>{formatPrice(training.price)}</span>
            </div>
          </div>

          <div className="mt-3 border-t pt-3">
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
                  {spotsRemaining} из {training.capacity} мест
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
