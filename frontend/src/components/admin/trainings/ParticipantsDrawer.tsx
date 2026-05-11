import React from 'react';
import {format, parseISO} from 'date-fns';
import {ru} from 'date-fns/locale';
import {X} from 'lucide-react';

import {Button} from '@/components/ui/Button';
import type {TrainingResponseDto, BookingResponseDto} from '@/types';

interface ParticipantsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: TrainingResponseDto | null;
  participants: BookingResponseDto[];
  isLoading?: boolean;
}

const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMMM yyyy, HH:mm', {locale: ru});
  } catch {
    return dateString;
  }
};

const formatBookingTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMM, HH:mm', {locale: ru});
  } catch {
    return dateString;
  }
};

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  open,
  onOpenChange,
  training,
  participants,
  isLoading,
}) => {
  if (!open) {
    return null;
  }

  if (!training) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="
          fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-lg
        "
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">
              Участники: {training.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <p className="mb-4 text-sm text-muted-foreground">
              {formatDateTime(training.scheduledAt)} •{' '}
              {training.currentParticipants} из {training.capacity} мест
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({length: 3}).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-sm bg-muted"
                  />
                ))}
              </div>
            ) : participants.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                На тренировку пока никто не записался
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {participants.map((participant, index) => (
                  <li
                    key={participant.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="text-sm">
                        Участник {participant.userId}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatBookingTime(participant.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
