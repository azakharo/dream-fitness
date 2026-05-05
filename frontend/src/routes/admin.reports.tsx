import {AdminReportsPage} from '@/pages/admin/AdminReportsPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/admin/reports')({
  component: AdminReportsPage,
});
