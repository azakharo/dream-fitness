import {createFileRoute, redirect} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';
import {AdminLayout} from '@/components/layout/AdminLayout';

/**
 * Layout route for administrative pages.
 * Checks that user is authenticated and has admin role.
 */
export const Route = createFileRoute('/_admin')({
  beforeLoad: () => {
    const {accessToken, user, isLoading} = useAuthStore.getState();

    if (isLoading) {
      return;
    }

    if (!accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({to: ROUTES.LOGIN});
    }

    if (user?.role !== 'admin') {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({to: ROUTES.UNAUTHORIZED});
    }
  },
  component: AdminLayout,
});
