import * as React from 'react';
import {ScheduleFilters} from '@/components/client/schedule/ScheduleFilters';
import {WeeklyCalendar} from '@/components/client/schedule/WeeklyCalendar';
import {
  useTrainings,
  useTrainers,
  type TrainingFilters,
} from '@/hooks/use-trainings';

export const SchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const [filters, setFilters] = React.useState<TrainingFilters>({});

  const {data: trainersData} = useTrainers();
  const trainers = trainersData?.items || [];

  const {data: trainingsData, isLoading: isTrainingsLoading} =
    useTrainings(filters);
  const trainings = trainingsData?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Расписание</h1>
        <p className="text-muted-foreground">Выберите тренировку</p>
      </div>

      <ScheduleFilters
        filters={filters}
        onFiltersChange={setFilters}
        trainers={trainers}
      />

      <WeeklyCalendar
        trainings={trainings}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        isLoading={isTrainingsLoading}
      />
    </div>
  );
};
