import {createFileRoute, redirect} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';
import {ClientLayout} from '@/components/layout/ClientLayout';

export const Route = createFileRoute('/_client')({
  beforeLoad: () => {
    const {accessToken, isLoading} = useAuthStore.getState();

    if (isLoading) {
      return;
    }

    if (!accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({to: ROUTES.LOGIN});
    }
  },
  component: ClientLayout,
});
