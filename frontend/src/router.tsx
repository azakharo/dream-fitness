import {createRouter} from '@tanstack/react-router';
import {Route as rootRoute} from './routes/__root';
import {Route as authRoute} from './routes/_auth';
import {Route as authLoginRoute} from './routes/_auth.login';
import {Route as authRegisterRoute} from './routes/_auth.register';
import {Route as clientRoute} from './routes/_client';
import {Route as clientDashboardRoute} from './routes/_client.dashboard';
import {Route as indexRoute} from './routes/index';

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([authLoginRoute, authRegisterRoute]),
  clientRoute.addChildren([clientDashboardRoute]),
  indexRoute,
]);

export const router = createRouter({routeTree});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
