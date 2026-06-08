import {useParams} from '@tanstack/react-router';
import {useBalance} from '@/hooks/use-balance';
import {useBookings} from '@/hooks/use-bookings';
import {useTraining} from '@/hooks/use-trainings';
import {useWaitlistPosition} from '@/hooks/use-waitlist';
import {AvailabilityStatus} from '@/components/client/booking/AvailabilityStatus';
import {BookingActions} from '@/components/client/booking/BookingActions';
import {
  TrainingDetails,
  TrainingDetailsSkeleton,
} from '@/components/client/booking/TrainingDetails';
import {Skeleton} from '@/components/ui';

export const BookingPage: React.FC = () => {
  const {id} = useParams({from: '/_client/booking/$id'});

  const {data: training, isLoading: isTrainingLoading} = useTraining(id);
  const {data: balanceData, isLoading: isBalanceLoading} = useBalance();
  const {data: bookingsData} = useBookings();
  const {data: waitlistData, isLoading: isWaitlistLoading} =
    useWaitlistPosition(id);

  const confirmedBooking = bookingsData?.items.find(
    booking => booking.trainingId === id && booking.status === 'confirmed',
  );
  const isAlreadyBooked = confirmedBooking != null;

  const isInWaitlist = waitlistData != null && waitlistData.position !== -1;
  const waitlistPosition = waitlistData?.position;

  const userBalance = balanceData?.balance ?? 0;
  const hasAvailableSpots = (training?.availableSlots ?? 0) > 0;

  if (isTrainingLoading || isBalanceLoading || isWaitlistLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[oklch(0.15_0.02_130)]">
          Бронирование тренировки
        </h1>
        <div
          className="
            grid gap-6
            md:grid-cols-2
          "
        >
          <TrainingDetailsSkeleton />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[oklch(0.15_0.02_130)]">
          Бронирование тренировки
        </h1>
        <p className="text-muted-foreground">Тренировка не найдена</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[oklch(0.15_0.02_130)]">
        Бронирование тренировки
      </h1>
      <div
        className="
          grid gap-6
          md:grid-cols-2
        "
      >
        <div className="space-y-6">
          <TrainingDetails training={training} />
        </div>
        <div className="space-y-6">
          <AvailabilityStatus
            availableSpots={training.availableSlots}
            totalCapacity={training.capacity}
            price={training.price}
            userBalance={userBalance}
            isAlreadyBooked={isAlreadyBooked}
          />
          <BookingActions
            trainingId={id}
            bookingId={confirmedBooking?.id}
            hasAvailableSpots={hasAvailableSpots}
            userBalance={userBalance}
            price={training.price}
            isAlreadyBooked={isAlreadyBooked}
            waitlistPosition={waitlistPosition}
            isInWaitlist={isInWaitlist}
          />
        </div>
      </div>
    </div>
  );
};
