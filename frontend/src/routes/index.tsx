import {createFileRoute, redirect} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const {accessToken} = useAuthStore.getState();
    if (accessToken) {
      throw redirect({to: ROUTES.DASHBOARD});
    }
    throw redirect({to: ROUTES.LOGIN});
  },
});
