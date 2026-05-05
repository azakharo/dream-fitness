import {AdminDashboardPage} from '@/pages/admin/AdminDashboardPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
});
