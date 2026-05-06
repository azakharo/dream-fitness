import * as React from 'react';

import {BalanceCard} from '@/components/client/dashboard/BalanceCard';
import {QuickActions} from '@/components/client/dashboard/QuickActions';
import {UpcomingTrainings} from '@/components/client/dashboard/UpcomingTrainings';
import {useBalance} from '@/hooks/use-balance';
import {useBookings} from '@/hooks/use-bookings';
import {useTrainings} from '@/hooks/use-trainings';
import type {TrainingResponseDto} from '@/types';
import {isDateAfter, compareDatesAsc} from '@/lib/date-utils';

export const DashboardPage: React.FC = () => {
  const {data: balanceData, isLoading: isBalanceLoading} = useBalance();
  const {data: bookingsData, isLoading: isBookingsLoading} = useBookings({
    upcoming: true,
  });

  const {data: trainingsData, isLoading: isTrainingsLoading} = useTrainings();

  const upcomingTrainings: TrainingResponseDto[] = React.useMemo(() => {
    if (!trainingsData?.items || !bookingsData?.items) return [];

    const now = new Date();
    return trainingsData.items
      .filter(training => {
        const booking = bookingsData.items.find(
          b => b.trainingId === training.id,
        );
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
        <h1 className="text-2xl font-bold">Добро пожаловать!</h1>
        <p className="text-muted-foreground">Ваш фитнес-дневник</p>
      </div>

      <div className="flex flex-col gap-4">
        <BalanceCard balance={balance} isLoading={isBalanceLoading} />
        <UpcomingTrainings
          trainings={upcomingTrainings}
          isLoading={isLoading}
        />
        <QuickActions />
      </div>
    </div>
  );
};
