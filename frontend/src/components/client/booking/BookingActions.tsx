import {useCancelBooking, useCreateBooking} from '@/hooks/use-bookings';
import {useJoinWaitlist, useLeaveWaitlist} from '@/hooks/use-waitlist';
import {Button} from '@/components/ui/Button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {toast} from 'sonner';

interface BookingActionsProps {
  trainingId: string;
  hasAvailableSpots: boolean;
  userBalance: number;
  price: number;
  isAlreadyBooked: boolean;
  waitlistPosition?: number;
  isInWaitlist: boolean;
}

const formatNumber = (num: number) => num.toLocaleString('ru-RU');

export const BookingActions: React.FC<BookingActionsProps> = ({
  trainingId,
  hasAvailableSpots,
  userBalance,
  price,
  isAlreadyBooked,
  waitlistPosition,
  isInWaitlist,
}) => {
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();
  const joinWaitlist = useJoinWaitlist();
  const leaveWaitlist = useLeaveWaitlist();

  const hasEnoughBalance = userBalance >= price;
  const isLoading =
    createBooking.isPending ||
    cancelBooking.isPending ||
    joinWaitlist.isPending ||
    leaveWaitlist.isPending;

  const handleBook = () => {
    if (!hasEnoughBalance) {
      toast.error('Недостаточно баллов на балансе');
      return;
    }

    void (async () => {
      try {
        await createBooking.mutateAsync({trainingId});
        toast.success('Вы записаны на тренировку!');
      } catch {
        toast.error('Не удалось записаться на тренировку');
      }
    })();
  };

  const handleCancel = () => {
    void (async () => {
      try {
        await cancelBooking.mutateAsync({id: trainingId});
        toast.success('Запись на тренировку отменена');
      } catch {
        toast.error('Не удалось отменить запись');
      }
    })();
  };

  const handleJoinWaitlist = () => {
    void (async () => {
      try {
        await joinWaitlist.mutateAsync(trainingId);
        toast.success('Вы добавлены в очередь!');
      } catch {
        toast.error('Не удалось встать в очередь');
      }
    })();
  };

  const handleLeaveWaitlist = () => {
    void (async () => {
      try {
        await leaveWaitlist.mutateAsync(trainingId);
        toast.success('Вы покинули очередь');
      } catch {
        toast.error('Не удалось покинуть очередь');
      }
    })();
  };

  if (isAlreadyBooked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Бронирование</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-xl">✓</span>
            <span className="font-medium">Вы записаны на эту тренировку</span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? 'Отмена...' : 'Отменить запись'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isInWaitlist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Очередь</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <span className="text-xl">⏳</span>
            <span className="font-medium">
              Вы в очереди, позиция: {waitlistPosition}
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLeaveWaitlist}
            disabled={isLoading}
          >
            {isLoading ? 'Выход...' : 'Выйти из очереди'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasAvailableSpots) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Бронирование</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={handleBook}
            disabled={!hasEnoughBalance || isLoading}
          >
            {!hasEnoughBalance
              ? 'Недостаточно баллов'
              : isLoading
                ? 'Запись...'
                : `Записаться за ${formatNumber(price)} баллов`}
          </Button>
          {!hasEnoughBalance && (
            <p className="text-center text-sm text-muted-foreground">
              Пополните баланс для записи на тренировку
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Очередь</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-amber-600">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">Мест нет</span>
        </div>
        <Button
          className="w-full"
          variant="secondary"
          onClick={handleJoinWaitlist}
          disabled={isLoading}
        >
          {isLoading ? 'Добавление...' : 'Встать в очередь'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Когда место освободится, вы получите уведомление
        </p>
      </CardContent>
    </Card>
  );
};
