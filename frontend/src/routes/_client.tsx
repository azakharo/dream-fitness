import {createFileRoute, redirect, Outlet} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';

/**
 * Layout route для защищённых страниц клиента.
 * Если пользователь не авторизован — редирект на login.
 */
export const Route = createFileRoute('/_client')({
  beforeLoad: () => {
    const {accessToken, isLoading} = useAuthStore.getState();

    if (isLoading) {
      // Можно показать спиннер или вернуть pending state
      return;
    }

    if (!accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({to: ROUTES.LOGIN});
    }
  },
  component: () => <Outlet />,
});
