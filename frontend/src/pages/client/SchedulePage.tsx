import * as React from 'react';
import {ScheduleFilters} from '@/components/client/schedule/ScheduleFilters';
import {WeeklyCalendar} from '@/components/client/schedule/WeeklyCalendar';
import {TrainingCard} from '@/components/client/schedule/TrainingCard';
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

  const selectedDayTrainings = React.useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return (trainingsData?.items ?? []).filter(t =>
      t.scheduledAt.startsWith(dateStr),
    );
  }, [trainingsData, selectedDate]);

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

      {selectedDayTrainings.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-medium">
            Тренировки на{' '}
            {selectedDate.toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h2>
          <div
            className="
              grid gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {selectedDayTrainings.map(training => (
              <TrainingCard key={training.id} training={training} />
            ))}
          </div>
        </div>
      )}

      {!isTrainingsLoading && selectedDayTrainings.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>На выбранный день нет тренировок</p>
        </div>
      )}
    </div>
  );
};
