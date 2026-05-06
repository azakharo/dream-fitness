import {NotificationsPage} from '@/pages/client/NotificationsPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_client/notifications')({
  component: NotificationsPage,
});
