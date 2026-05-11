import * as React from 'react';
import {format} from 'date-fns';
import {toast} from 'sonner';
import {Download} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Skeleton} from '@/components/ui/Skeleton';

export interface FinancialReportProps {
  data: {
    startDate: Date;
    endDate: Date;
    deposits: number;
    withdrawals: number;
    refunds: number;
    net: number;
  }[];
  isLoading?: boolean;
}

export const FinancialReport: React.FC<FinancialReportProps> = ({
  data,
  isLoading = false,
}) => {
  const handleExportCSV = () => {
    toast.info('Ещё не реализовано');
  };

  const formatCurrency = (value: number): string => {
    const formatted = new Intl.NumberFormat('ru-RU').format(Math.abs(value));
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatPeriod = (start: Date, end: Date): string => {
    return `${format(start, 'dd.MM')} - ${format(end, 'dd.MM')}`;
  };

  const totals = data.reduce(
    (acc, item) => ({
      deposits: acc.deposits + item.deposits,
      withdrawals: acc.withdrawals + item.withdrawals,
      refunds: acc.refunds + item.refunds,
      net: acc.net + item.net,
    }),
    {deposits: 0, withdrawals: 0, refunds: 0, net: 0},
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Финансовый отчёт</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-50 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Финансовый отчёт</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 size-4" />
            Экспорт CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div
            className="
              flex h-50 items-center justify-center text-muted-foreground
            "
          >
            Нет данных за выбранный период
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Период</TableHead>
                  <TableHead className="text-right">Пополнения</TableHead>
                  <TableHead className="text-right">Списания</TableHead>
                  <TableHead className="text-right">Возвраты</TableHead>
                  <TableHead className="text-right">Итого</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  // eslint-disable-next-line react-x/no-array-index-key
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatPeriod(item.startDate, item.endDate)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(item.deposits)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(-item.withdrawals)}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {formatCurrency(-item.refunds)}
                    </TableCell>
                    <TableCell
                      className={`
                        text-right font-medium
                        ${item.net >= 0 ? 'text-green-600' : 'text-red-600'}
                      `}
                    >
                      {formatCurrency(item.net)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Итого</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(totals.deposits)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(-totals.withdrawals)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    {formatCurrency(-totals.refunds)}
                  </TableCell>
                  <TableCell
                    className={`
                      text-right
                      ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}
                    `}
                  >
                    {formatCurrency(totals.net)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
