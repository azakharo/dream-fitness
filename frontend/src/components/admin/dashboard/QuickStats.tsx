import * as React from 'react';
import {startOfWeek, endOfWeek} from 'date-fns';
import {Users, Dumbbell, TrendingUp, UserCheck} from 'lucide-react';
import {StatsWidget} from './StatsWidget';
import {useUsers} from '@/hooks/use-users';
import {useTrainers} from '@/hooks/use-trainers';
import {useTrainings} from '@/hooks/use-trainings';
import {useLoadingStats} from '@/hooks/use-reports';

export const QuickStats: React.FC = () => {
  const now = new Date();
  const weekStart = startOfWeek(now, {weekStartsOn: 1});
  const weekEnd = endOfWeek(now, {weekStartsOn: 1});

  const {data: usersData, isLoading: isUsersLoading} = useUsers({
    status: 'active',
  });
  const {data: trainersData, isLoading: isTrainersLoading} = useTrainers({
    activeOnly: true,
  });
  const {data: trainingsData, isLoading: isTrainingsLoading} = useTrainings({
    dateFrom: weekStart,
    dateTo: weekEnd,
  });
  const {data: loadingStatsData, isLoading: isLoadingStatsLoading} =
    useLoadingStats(weekStart, weekEnd);

  const activeClients = usersData?.total ?? 0;
  const activeTrainers = trainersData?.length ?? 0;
  const trainingsThisWeek = trainingsData?.count ?? 0;
  const avgOccupancy = loadingStatsData?.occupancyRate ?? 0;

  return (
    <div
      className="
        grid gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >
      <StatsWidget
        title="Активные клиенты"
        value={activeClients}
        icon={<Users className="size-6 text-blue-600" />}
        trend={{value: 12, isPositive: true}}
        isLoading={isUsersLoading}
      />
      <StatsWidget
        title="Тренировок на неделе"
        value={trainingsThisWeek}
        icon={<Dumbbell className="size-6 text-green-600" />}
        trend={{value: 5, isPositive: true}}
        isLoading={isTrainingsLoading}
      />
      <StatsWidget
        title="Средняя заполняемость"
        value={`${avgOccupancy.toFixed(0)}%`}
        icon={<TrendingUp className="size-6 text-purple-600" />}
        trend={{value: 8, isPositive: true}}
        isLoading={isLoadingStatsLoading}
      />
      <StatsWidget
        title="Активные тренеры"
        value={activeTrainers}
        icon={<UserCheck className="size-6 text-orange-600" />}
        isLoading={isTrainersLoading}
      />
    </div>
  );
};
