import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';

interface AvailabilityStatusProps {
  availableSpots: number;
  totalCapacity: number;
  price: number;
  userBalance: number;
  isAlreadyBooked: boolean;
}

const formatNumber = (num: number) => num.toLocaleString('ru-RU');

export const AvailabilityStatus: React.FC<AvailabilityStatusProps> = ({
  availableSpots,
  totalCapacity,
  price,
  userBalance,
  isAlreadyBooked,
}) => {
  const fillPercentage =
    totalCapacity > 0 ? (availableSpots / totalCapacity) * 100 : 0;

  const getStatusColor = () => {
    if (fillPercentage > 50) return 'bg-green-500';
    if (fillPercentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const hasEnoughBalance = userBalance >= price;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Доступность</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Доступно мест:</span>
            <span className="font-medium">
              {availableSpots} из {totalCapacity}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`
                h-full
                ${getStatusColor()}
                transition-all
              `}
              style={{width: `${fillPercentage}%`}}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {Math.round(fillPercentage)}% свободно
          </span>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Стоимость:</span>
            <span className="font-medium">{formatNumber(price)} баллов</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ваш баланс:</span>
            <span className="font-medium">
              {formatNumber(userBalance)} баллов
            </span>
          </div>
          {!isAlreadyBooked && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Статус баланса:</span>
              {hasEnoughBalance ? (
                <span className="flex items-center gap-1 font-medium text-green-600">
                  ✓ Достаточно
                </span>
              ) : (
                <span className="flex items-center gap-1 font-medium text-red-600">
                  ✗ Недостаточно
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
