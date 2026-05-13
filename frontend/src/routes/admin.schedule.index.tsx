import {AdminSchedulePage} from '@/pages/admin/AdminSchedulePage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/admin/schedule/')({
  component: AdminSchedulePage,
});
