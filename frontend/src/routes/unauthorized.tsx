import {UnauthorizedPage} from '@/pages/auth/UnauthorizedPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
});
