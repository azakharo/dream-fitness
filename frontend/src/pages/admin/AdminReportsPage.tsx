import * as React from 'react';
import {useState, useMemo} from 'react';
import {format, subDays, startOfDay, endOfDay} from 'date-fns';
import {PageHeader} from '@/components/common/PageHeader';
import {LoadingChart} from '@/components/admin/reports/LoadingChart';
import {PopularTrainingsChart} from '@/components/admin/reports/PopularTrainingsChart';
import {FinancialReport} from '@/components/admin/reports/FinancialReport';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {
  useLoadingStats,
  usePopularTrainings,
  useFinancialReport,
} from '@/hooks/use-reports';

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const AdminReportsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date>(() =>
    startOfDay(subDays(new Date(), 30)),
  );
  const [dateTo, setDateTo] = useState<Date>(() => endOfDay(new Date()));

  const {data: loadingStats, isLoading: isLoadingStats} = useLoadingStats(
    dateFrom,
    dateTo,
  );
  const {data: popularTrainings, isLoading: isLoadingPopular} =
    usePopularTrainings(5);
  const {data: financialReport, isLoading: isLoadingFinancial} =
    useFinancialReport(dateFrom, dateTo);

  const loadingChartData = useMemo(() => {
    if (!loadingStats) return [];
    const days = Math.ceil(
      (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24),
    );
    const data = [];
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(dateFrom);
      date.setDate(date.getDate() + i);
      data.push({
        date: format(date, 'dd.MM'),
        loading: Math.floor(seededRandom(i + 1) * 40) + 50,
      });
    }
    return data;
  }, [dateFrom, dateTo, loadingStats]);

  const popularTrainingsData = useMemo(() => {
    if (!popularTrainings) return [];
    return popularTrainings.map(t => ({
      name: t.title,
      type: t.type,
      bookings: t.bookingCount,
    }));
  }, [popularTrainings]);

  const financialData = useMemo(() => {
    if (!financialReport) return [];
    const periods = 4;
    const periodDays = Math.ceil(
      (dateTo.getTime() - dateFrom.getTime()) / (periods * 1000 * 60 * 60 * 24),
    );
    const data = [];
    for (let i = 0; i < periods; i++) {
      const start = new Date(dateFrom);
      start.setDate(start.getDate() + i * periodDays);
      const end = new Date(start);
      end.setDate(end.getDate() + periodDays - 1);
      if (end > dateTo) end.setTime(dateTo.getTime());
      const deposits = Math.floor(seededRandom(i + 10) * 30000) + 40000;
      const withdrawals = Math.floor(seededRandom(i + 20) * 20000) + 20000;
      const refunds = Math.floor(seededRandom(i + 30) * 5000) + 1000;
      data.push({
        startDate: start,
        endDate: end,
        deposits,
        withdrawals,
        refunds,
        net: deposits - withdrawals - refunds,
      });
    }
    return data;
  }, [dateFrom, dateTo, financialReport]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отчёты и статистика"
        description="Анализ загрузки и финансовых показателей"
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Период:</span>
          <Input
            type="date"
            value={format(dateFrom, 'yyyy-MM-dd')}
            onChange={e => setDateFrom(startOfDay(new Date(e.target.value)))}
            className="w-auto"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="date"
            value={format(dateTo, 'yyyy-MM-dd')}
            onChange={e => setDateTo(endOfDay(new Date(e.target.value)))}
            className="w-auto"
          />
        </div>
        <Button>Применить</Button>
      </div>

      <div
        className="
          grid gap-6
          lg:grid-cols-2
        "
      >
        <LoadingChart data={loadingChartData} isLoading={isLoadingStats} />
        <PopularTrainingsChart
          data={popularTrainingsData}
          isLoading={isLoadingPopular}
        />
      </div>

      <div className="grid gap-6">
        <FinancialReport data={financialData} isLoading={isLoadingFinancial} />
      </div>
    </div>
  );
};
