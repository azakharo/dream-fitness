import * as React from 'react';
import {useNavigate} from '@tanstack/react-router';

import {ScheduleFilters} from '@/components/client/schedule/ScheduleFilters';
import {WeeklyCalendar} from '@/components/client/schedule/WeeklyCalendar';
import {
  useTrainings,
  useTrainers,
  type TrainingFilters,
} from '@/hooks/use-trainings';
import {formatDateKey, getWeekStart, parseApiDate} from '@/lib/date-utils';
import {Route} from '@/routes/_client.schedule';

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate({from: Route.fullPath});

  // Read URL search params via TanStack Router (fully typed via validateSearch)
  const search = Route.useSearch();

  // Parse week from URL or default to current week's Monday
  const currentWeekStart = search.week
    ? parseApiDate(search.week)
    : getWeekStart(new Date());

  const filters: TrainingFilters = {
    type: search.trainingTypeId,
    trainerId: search.trainerId,
  };

  const {data: trainersData} = useTrainers();
  const trainers = trainersData ?? [];

  const {data: trainingsData, isLoading: isTrainingsLoading} =
    useTrainings(filters);
  const trainings = trainingsData?.items || [];

  const handleFiltersChange = (newFilters: TrainingFilters) => {
    void navigate({
      search: prev => ({
        ...prev,
        trainingTypeId: newFilters.type,
        trainerId: newFilters.trainerId,
      }),
    });
  };

  const handleWeekChange = (newWeekStart: Date) => {
    void navigate({
      search: prev => ({
        ...prev,
        week: formatDateKey(newWeekStart),
      }),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Расписание</h1>
        <p className="text-muted-foreground">Выберите тренировку</p>
      </div>

      <ScheduleFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        trainers={trainers}
      />

      <WeeklyCalendar
        trainings={trainings}
        currentWeekStart={currentWeekStart}
        onWeekChange={handleWeekChange}
        isLoading={isTrainingsLoading}
      />
    </div>
  );
};
