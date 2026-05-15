import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';
import {Skeleton} from '@/components/ui';

export interface PopularTrainingsChartProps {
  data: {
    name: string;
    type: string;
    bookings: number;
  }[];
  isLoading?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  yoga: 'hsl(var(--chart-1))',
  crossfit: 'hsl(var(--chart-2))',
  pilates: 'hsl(var(--chart-3))',
  boxing: 'hsl(var(--chart-4))',
  dance: 'hsl(var(--chart-5))',
  hiit: 'hsl(var(--primary))',
  default: 'hsl(var(--muted-foreground))',
};

export const PopularTrainingsChart: React.FC<PopularTrainingsChartProps> = ({
  data,
  isLoading = false,
}) => {
  const getBarColor = (type: string): string => {
    return TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS.default;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Популярные тренировки</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Популярные тренировки</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart
              data={data}
              margin={{top: 5, right: 20, left: 0, bottom: 5}}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{fontSize: 12}}
                tickLine={{stroke: 'currentColor'}}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{fontSize: 12}}
                tickLine={{stroke: 'currentColor'}}
                tickFormatter={value => `${value}`}
              />
              <Tooltip
                formatter={(value: unknown) => [
                  `${String(value)} бронирований`,
                  'Бронирования',
                ]}
                labelFormatter={label => `Тренировка: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    // eslint-disable-next-line react-x/no-array-index-key
                    key={`${entry.name}-${entry.type}-${index}`}
                    fill={getBarColor(entry.type)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
