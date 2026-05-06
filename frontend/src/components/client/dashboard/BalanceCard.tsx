import * as React from 'react';
import {Link} from '@tanstack/react-router';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button, Skeleton} from '@/components/ui';
import {ROUTES} from '@/lib/routes';

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
        <Link to={ROUTES.PROFILE}>
          <Button variant="default" size="sm">
            Пополнить
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
