import * as React from 'react';

import {cn} from '@/lib/utils';
import {Card, CardContent, CardHeader} from '@/components/ui/Card';

function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export {Skeleton};

// Skeleton Variants

export const CardSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
);

export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4">
    <Skeleton className="size-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const TrainingCardSkeleton: React.FC = () => (
  <Card>
    <CardContent className="space-y-3 p-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);
