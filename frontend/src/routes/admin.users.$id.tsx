import {AdminUserDetailPage} from '@/pages/admin/AdminUserDetailPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/admin/users/$id')({
  component: AdminUserDetailPage,
  staticData: {
    title: 'Детали пользователя',
  },
});
