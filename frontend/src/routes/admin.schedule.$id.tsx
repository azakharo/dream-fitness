import {AdminScheduleEditPage} from '@/pages/admin/AdminScheduleEditPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/admin/schedule/$id')({
  component: AdminScheduleEditPage,
});
