import {createFileRoute} from '@tanstack/react-router';

import {AdminTrainersPage} from '@/pages/admin/AdminTrainersPage';

export const Route = createFileRoute('/admin/trainers')({
  component: AdminTrainersPage,
});
