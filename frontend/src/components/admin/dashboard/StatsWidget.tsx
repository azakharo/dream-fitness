import * as React from 'react';
import {TrendingDown, TrendingUp} from 'lucide-react';
import {Card} from '@/components/ui/Card';
import {Skeleton} from '@/components/ui/Skeleton';

export interface StatsWidgetProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="mb-2 h-8 w-20" />
        <Skeleton className="h-4 w-24" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {trend && (
            <div
              className={`
                flex items-center gap-1 text-sm
                ${trend.isPositive ? 'text-green-600' : 'text-red-600'}
              `}
            >
              {trend.isPositive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              <span>
                {trend.isPositive ? '+' : '-'}
                {trend.value}
                {typeof trend.value === 'number' && !description ? '%' : ''}
                {description ? ` за ${description}` : ''}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="
              flex size-12 items-center justify-center rounded-full bg-muted
            "
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
