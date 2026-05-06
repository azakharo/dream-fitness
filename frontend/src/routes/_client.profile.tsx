import {ProfilePage} from '@/pages/client/ProfilePage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_client/profile')({
  component: ProfilePage,
});
