import * as React from 'react';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button} from '@/components/ui';

export const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <a href="/schedule">
          <Button variant="default" size="sm">
            Найти тренировку
          </Button>
        </a>
        <a href="/history">
          <Button variant="outline" size="sm">
            История
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};
