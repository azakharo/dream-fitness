import {DashboardPage} from '@/pages/client/DashboardPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_client/dashboard')({
  component: DashboardPage,
});
