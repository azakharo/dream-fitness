import {AdminScheduleCreatePage} from '@/pages/admin/AdminScheduleCreatePage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/admin/schedule/new')({
  component: AdminScheduleCreatePage,
});
