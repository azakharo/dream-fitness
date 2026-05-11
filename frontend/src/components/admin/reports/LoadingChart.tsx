import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Skeleton} from '@/components/ui/Skeleton';

export interface LoadingChartProps {
  data: {
    date: string;
    loading: number;
  }[];
  isLoading?: boolean;
}

export const LoadingChart: React.FC<LoadingChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Загрузка тренировок</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Загрузка тренировок</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{top: 5, right: 20, left: 0, bottom: 5}}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{fontSize: 12}}
                tickLine={{stroke: 'currentColor'}}
              />
              <YAxis
                domain={[0, 100]}
                tick={{fontSize: 12}}
                tickLine={{stroke: 'currentColor'}}
                tickFormatter={value => `${value}%`}
              />
              <Tooltip
                formatter={(value: unknown) => [
                  `${String(value)}%`,
                  'Загрузка',
                ]}
                labelFormatter={label => `Дата: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Line
                type="monotone"
                dataKey="loading"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{fill: 'hsl(var(--primary))', strokeWidth: 2}}
                activeDot={{r: 6}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
