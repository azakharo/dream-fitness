import {createFileRoute, redirect} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const {accessToken} = useAuthStore.getState();
    if (accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({to: ROUTES.DASHBOARD});
    }
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({to: ROUTES.LOGIN});
  },
});
