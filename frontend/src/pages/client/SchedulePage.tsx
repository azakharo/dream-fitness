import * as React from 'react';
import {useNavigate} from '@tanstack/react-router';
import {Gift, Droplets, TrendingUp} from 'lucide-react';

import {ScheduleFilters} from '@/components/client/schedule/ScheduleFilters';
import {WeeklyCalendar} from '@/components/client/schedule/WeeklyCalendar';
import {MotivationBanner} from '@/components/common/MotivationBanner';
import {TipCard} from '@/components/common/TipCard';
import {
  useTrainings,
  useTrainers,
  type TrainingFilters,
} from '@/hooks/use-trainings';
import {formatDateKey, getWeekStart, parseApiDate} from '@/lib/date-utils';
import {Route} from '@/routes/_client.schedule';

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate({from: Route.fullPath});

  const search = Route.useSearch();

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
        <h1 className="text-2xl font-bold text-[oklch(0.15_0.02_130)]">
          Расписание
        </h1>
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

      <MotivationBanner
        title="Запишись на 5 тренировок и получи бонус!"
        description="Каждая 6-я тренировка — бесплатно"
        icon={<Gift />}
      />

      <div
        className="
          grid gap-4
          md:grid-cols-3
        "
      >
        <TipCard
          title="Приходи вовремя"
          text="Приходи за 10-15 минут до начала, чтобы успеть переодеться и настроиться на тренировку"
          icon={<TrendingUp />}
        />
        <TipCard
          title="Пей воду"
          text="Не забывай брать воду на тренировку. Гидратация важна для эффективных занятий"
          icon={<Droplets />}
        />
        <TipCard
          title="Отслеживай прогресс"
          text="Записывай свои достижения и следи за прогрессом в личном кабинете"
          icon={<TrendingUp />}
        />
      </div>
    </div>
  );
};
