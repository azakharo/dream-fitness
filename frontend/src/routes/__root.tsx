import {createRootRoute, Outlet} from '@tanstack/react-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from 'sonner';
import {Agentation} from 'agentation';

import {NotFoundPage} from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.PROD ? 1000 * 5 : 0,
      retry: import.meta.env.PROD ? 1 : 0,
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" richColors />
      <Agentation />
    </QueryClientProvider>
  ),
  notFoundComponent: NotFoundPage,
});
