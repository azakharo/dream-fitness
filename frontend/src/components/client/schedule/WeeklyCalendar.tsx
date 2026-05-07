import React, {useState, useMemo} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Link} from '@tanstack/react-router';
import {Button} from '@/components/ui/Button';
import {Skeleton} from '@/components/ui/Skeleton';
import type {TrainingResponseDto} from '@/types';
import {useBookings} from '@/hooks/use-bookings';
import {useWaitlist} from '@/hooks/use-waitlist';
import {
  getWeekStart,
  addWeeksToDate,
  isDateToday,
  formatMonthYear,
  formatTime,
  formatDateKey,
} from '@/lib/date-utils';

interface WeeklyCalendarProps {
  trainings: TrainingResponseDto[];
  currentWeekStart: Date;
  onWeekChange: (newWeekStart: Date) => void;
  isLoading?: boolean;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MAX_VISIBLE_TRAININGS = 3;

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  trainings,
  currentWeekStart,
  onWeekChange,
  isLoading = false,
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    () => new Set(),
  );

  const {data: bookingsData} = useBookings();
  const {data: waitlistData} = useWaitlist();

  const userBookedTrainingIds = useMemo(() => {
    const bookedIds = new Set<string>();
    const bookings = bookingsData?.items ?? [];
    for (const booking of bookings) {
      if (booking.status === 'confirmed') {
        bookedIds.add(booking.trainingId);
      }
    }
    return bookedIds;
  }, [bookingsData]);

  const userWaitlistPositions = useMemo(() => {
    const positions = new Map<string, number>();
    const waitlist = waitlistData ?? [];
    for (const entry of waitlist) {
      positions.set(entry.trainingId, entry.position);
    }
    return positions;
  }, [waitlistData]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  const trainingsByDay = useMemo(() => {
    const map = new Map<string, TrainingResponseDto[]>();

    // Initialize map with all days of the week using local date keys
    weekDays.forEach(day => {
      map.set(formatDateKey(day), []);
    });

    // Group trainings by their scheduled date
    trainings.forEach(training => {
      const dateKey = formatDateKey(training.scheduledAt);
      const existing = map.get(dateKey);
      if (existing) {
        existing.push(training);
      }
    });

    // Sort trainings within each day by start time
    map.forEach(dayTrainings => {
      dayTrainings.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
    });

    return map;
  }, [trainings, weekDays]);

  const goToPreviousWeek = () => {
    onWeekChange(addWeeksToDate(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeksToDate(currentWeekStart, 1));
  };

  const goToToday = () => {
    onWeekChange(getWeekStart(new Date()));
  };

  const toggleExpanded = (dayIndex: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
  };

  if (isLoading) {
    /* eslint-disable react-x/no-array-index-key */
    return (
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <Skeleton className="mx-auto h-8 w-48" />
        </div>
        <div className="grid grid-cols-7 divide-x">
          {Array.from({length: 7}).map((_, i) => (
            <div key={i} className="p-2">
              <Skeleton className="mx-auto mb-2 h-4 w-8" />
              <Skeleton className="mx-auto mb-2 size-8" />
              <div className="space-y-2">
                {Array.from({length: 3}).map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    /* eslint-enable react-x/no-array-index-key */
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Header with navigation */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <h2 className="text-lg font-medium capitalize">
          {formatMonthYear(currentWeekStart)}
        </h2>
        <Button variant="ghost" size="sm" onClick={goToToday}>
          На сегодня
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {weekDays.map((day, index) => (
          <div key={day.toISOString()} className="p-2 text-center">
            <div className="text-xs font-medium text-muted-foreground">
              {WEEKDAYS[index]}
            </div>
            <div
              className={`
                mt-1 inline-flex size-8 items-center justify-center rounded-full
                text-sm
                ${isDateToday(day) ? 'bg-primary text-primary-foreground' : ''}
              `}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Training slots */}
      <div className="grid max-h-125 grid-cols-7 divide-x overflow-y-auto">
        {weekDays.map((day, dayIndex) => {
          const dateKey = formatDateKey(day);
          const dayTrainings = trainingsByDay.get(dateKey) || [];
          const isExpanded = expandedDays.has(dayIndex);
          const visibleTrainings = isExpanded
            ? dayTrainings
            : dayTrainings.slice(0, MAX_VISIBLE_TRAININGS);
          const hiddenCount = dayTrainings.length - MAX_VISIBLE_TRAININGS;

          return (
            <div key={day.toISOString()} className="min-h-30 p-2">
              {visibleTrainings.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Нет тренировок
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleTrainings.map(training => {
                    const startTime = new Date(training.scheduledAt);
                    const isFull = training.availableSlots === 0;
                    const isBooked = userBookedTrainingIds.has(training.id);
                    const waitlistPosition = userWaitlistPositions.get(
                      training.id,
                    );

                    return (
                      <Link
                        key={training.id}
                        to="/booking/$id"
                        params={{id: training.id}}
                        className={`
                          block rounded-md p-2 text-xs transition-all
                          hover:ring-2 hover:ring-primary/20
                          ${
                            isFull
                              ? 'bg-muted/50 opacity-60'
                              : `
                                border bg-background
                                hover:shadow-sm
                              `
                          }
                        `}
                      >
                        <div className="truncate font-medium">
                          {formatTime(startTime)}
                        </div>
                        <div className="truncate text-muted-foreground">
                          {training.title}
                        </div>
                        {training.trainerName && (
                          <div
                            className="
                              truncate text-[10px] text-muted-foreground
                            "
                          >
                            {training.trainerName}
                          </div>
                        )}
                        {isBooked && (
                          <div className="text-[10px] font-medium text-primary">
                            Вы записаны
                          </div>
                        )}
                        {!isBooked && waitlistPosition !== undefined && (
                          <div className="text-[10px] font-medium text-orange-600">
                            {`Лист ожидания: позиция ${waitlistPosition}`}
                          </div>
                        )}
                        {!isBooked && waitlistPosition === undefined && (
                          <div
                            className={`
                              text-[10px]
                              ${
                                isFull
                                  ? 'font-medium text-destructive'
                                  : `text-muted-foreground`
                              }
                            `}
                          >
                            {isFull
                              ? 'Мест нет'
                              : `Свободно: ${training.availableSlots} мест`}
                          </div>
                        )}
                      </Link>
                    );
                  })}

                  {!isExpanded && hiddenCount > 0 && (
                    <button
                      onClick={() => toggleExpanded(dayIndex)}
                      className="
                        w-full rounded-md p-1 text-xs text-primary
                        transition-colors
                        hover:bg-primary/10
                      "
                    >
                      Ещё ({hiddenCount})
                    </button>
                  )}

                  {isExpanded &&
                    dayTrainings.length > MAX_VISIBLE_TRAININGS && (
                      <button
                        onClick={() => toggleExpanded(dayIndex)}
                        className="
                          w-full rounded-md p-1 text-xs text-muted-foreground
                          transition-colors
                          hover:bg-muted
                        "
                      >
                        Свернуть
                      </button>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
