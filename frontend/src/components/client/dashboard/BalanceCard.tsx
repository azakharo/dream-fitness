import * as React from 'react';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button, Skeleton} from '@/components/ui';

interface BalanceCardProps {
  balance: number;
  isLoading?: boolean;
}

const formatBalance = (balance: number): string => {
  return new Intl.NumberFormat('ru-RU').format(balance);
};

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  isLoading = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваш баланс</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <div className="text-2xl font-semibold">
            {formatBalance(balance)} баллов
          </div>
        )}
        <a href="/profile">
          <Button variant="default" size="sm">
            Пополнить
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};
