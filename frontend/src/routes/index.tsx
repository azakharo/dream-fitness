import {createFileRoute, redirect} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const {accessToken, user} = useAuthStore.getState();
    if (accessToken) {
      const destination =
        user?.role === 'admin' ? ROUTES.ADMIN_ROOT : ROUTES.DASHBOARD;
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({to: destination});
    }
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({to: ROUTES.LOGIN});
  },
});
