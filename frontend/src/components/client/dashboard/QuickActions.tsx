import * as React from 'react';
import {Link} from '@tanstack/react-router';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';
import {Button} from '@/components/ui';
import {ROUTES} from '@/lib/routes';

export const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Link to={ROUTES.SCHEDULE}>
          <Button variant="default" size="sm">
            Найти тренировку
          </Button>
        </Link>
        <Link to={ROUTES.HISTORY}>
          <Button variant="outline" size="sm">
            История
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
