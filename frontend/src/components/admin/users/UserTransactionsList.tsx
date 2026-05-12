import React from 'react';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {ArrowDown, ArrowUp, RotateCcw} from 'lucide-react';

import {Button} from '@/components/ui/Button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Skeleton} from '@/components/ui/Skeleton';
import type {TransactionType} from '@/types';

interface UserTransactionsListProps {
  userId: string;
  limit?: number;
}

interface MockTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description?: string;
  createdAt: string;
  displayDescription: string;
}

const mockTransactions: MockTransaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 500,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    displayDescription: 'Депозит +500 баллов',
  },
  {
    id: '2',
    type: 'withdraw',
    amount: 300,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    displayDescription: 'Списание -300 баллов (Yoga)',
  },
  {
    id: '3',
    type: 'deposit',
    amount: 1000,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    displayDescription: 'Депозит +1000 баллов',
  },
  {
    id: '4',
    type: 'refund',
    amount: 200,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    displayDescription: 'Возврат +200 баллов',
  },
  {
    id: '5',
    type: 'withdraw',
    amount: 500,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    displayDescription: 'Списание -500 баллов (CrossFit)',
  },
];

const formatTransactionDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd MMM', {locale: ru});
  } catch {
    return '—';
  }
};

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'deposit':
      return <ArrowUp className="size-4 text-green-600" />;
    case 'withdraw':
      return <ArrowDown className="size-4 text-red-600" />;
    case 'refund':
      return <RotateCcw className="size-4 text-blue-600" />;
    default:
      return <ArrowUp className="size-4 text-muted-foreground" />;
  }
};

export const UserTransactionsList: React.FC<UserTransactionsListProps> = ({
  userId,
  limit = 5,
}) => {
  // TODO: Replace mock data with actual API call when endpoint is available
  void userId;
  const [showAll, setShowAll] = React.useState(false);
  const isLoading = false;

  const displayedTransactions = showAll
    ? mockTransactions
    : mockTransactions.slice(0, limit);

  const hasMore = mockTransactions.length > limit;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (mockTransactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Последние транзакции (mock)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Нет транзакций</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Последние транзакции (mock)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedTransactions.map(transaction => (
          <div
            key={transaction.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getTransactionIcon(transaction.type)}
              <span className="text-sm text-muted-foreground">
                {transaction.displayDescription}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTransactionDate(transaction.createdAt)}
            </span>
          </div>
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="mt-2 w-full"
          >
            {showAll ? 'Скрыть' : 'Показать ещё →'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
