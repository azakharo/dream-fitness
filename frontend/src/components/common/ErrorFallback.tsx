import type {FallbackProps} from 'react-error-boundary';
import {AlertTriangle, RefreshCw} from 'lucide-react';

import {Button} from '@/components/ui/Button';

export const ErrorFallback: React.FC<FallbackProps> = ({
  resetErrorBoundary,
}) => {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center p-8">
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Что-то пошло не так</h2>
      <p className="mb-6 text-muted-foreground">
        Попробуйте ещё раз или обновите страницу
      </p>
      <Button onClick={resetErrorBoundary} className="gap-2">
        <RefreshCw className="size-4" />
        Обновить страницу
      </Button>
    </div>
  );
};
