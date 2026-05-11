import * as React from 'react';
import {PageHeader} from '@/components/common/PageHeader';
import {QuickStats} from '@/components/admin/dashboard/QuickStats';
import {RecentActivity} from '@/components/admin/dashboard/RecentActivity';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Панель управления"
        description="Обзор активности и статистики за неделю"
      />
      <QuickStats />
      <RecentActivity limit={10} />
    </div>
  );
};
