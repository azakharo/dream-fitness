import * as React from 'react';
import {ArrowLeft} from 'lucide-react';

import {Button} from '@/components/ui';
import {useRouter} from '@tanstack/react-router';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  showBack = false,
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.history.back();
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Назад
        </Button>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
