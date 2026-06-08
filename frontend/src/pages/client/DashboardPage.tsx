import * as React from 'react';
import {Flame} from 'lucide-react';

import {BalanceCard} from '@/components/client/dashboard/BalanceCard';
import {QuickActions} from '@/components/client/dashboard/QuickActions';
import {UpcomingTrainings} from '@/components/client/dashboard/UpcomingTrainings';
import {MotivationBanner} from '@/components/common/MotivationBanner';
import {useBalance} from '@/hooks/use-balance';
import {useTrainings} from '@/hooks/use-trainings';
import type {TrainingResponseDto} from '@/types';
import {isDateAfter, compareDatesAsc} from '@/lib/date-utils';
import {useEnrichedBookings} from '@/hooks';

export const DashboardPage: React.FC = () => {
  const {data: balanceData, isLoading: isBalanceLoading} = useBalance();
  const {data: bookingsData, isLoading: isBookingsLoading} =
    useEnrichedBookings({
      upcoming: true,
    });

  const {data: trainingsData, isLoading: isTrainingsLoading} = useTrainings();

  const upcomingTrainings: TrainingResponseDto[] = React.useMemo(() => {
    if (!trainingsData?.items || !bookingsData) return [];

    const now = new Date();
    return trainingsData.items
      .filter(training => {
        const booking = bookingsData.find(b => b.trainingId === training.id);
        const hasActiveBooking = booking && booking.status === 'confirmed';
        const isFuture = isDateAfter(training.scheduledAt, now);
        return hasActiveBooking && isFuture;
      })
      .sort((a, b) => compareDatesAsc(a.scheduledAt, b.scheduledAt));
  }, [trainingsData, bookingsData]);

  const isLoading = isBalanceLoading || isBookingsLoading || isTrainingsLoading;
  const balance = balanceData?.balance ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[oklch(0.15_0.02_130)]">
          Добро пожаловать!
        </h1>
        <p className="text-muted-foreground">Ваш фитнес-дневник</p>
      </div>

      <div className="flex flex-col gap-4">
        <BalanceCard balance={balance} isLoading={isBalanceLoading} />
        <UpcomingTrainings
          trainings={upcomingTrainings}
          isLoading={isLoading}
        />
        <QuickActions />

        <MotivationBanner
          title="Продолжай в том же духе!"
          description="Каждая тренировка приближает тебя к цели"
          icon={<Flame />}
        />
      </div>
    </div>
  );
};
