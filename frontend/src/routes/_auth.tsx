import {createFileRoute, redirect, Outlet} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';

/**
 * Layout route для публичных страниц (login, register).
 * Если пользователь уже авторизован — редирект на dashboard.
 * Префикс _ означает Route Group — маршрут не добавляется к URL.
 */
export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    const {accessToken, user} = useAuthStore.getState();
    if (accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: user?.role === 'admin' ? ROUTES.ADMIN_ROOT : ROUTES.DASHBOARD,
      });
    }
  },
  component: () => <Outlet />,
});
