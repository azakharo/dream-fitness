import {createRootRoute, Outlet} from '@tanstack/react-router';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';
import {Toaster} from 'sonner';
import {Agentation} from 'agentation';
import {toast} from 'sonner';

import {NotFoundPage} from '@/pages/NotFoundPage';
import {ErrorFallback} from '@/components/common/ErrorFallback';
import {ApiError} from '@/lib/api-client';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: error => {
      const apiError = error instanceof ApiError ? error : null;

      // 404 - handled by component (show "not found" state)
      if (apiError?.status === 404) {
        return;
      }

      // 401 - handled by api-client (redirect to login)
      if (apiError?.status === 401) {
        return;
      }

      // 403 - show forbidden message
      if (apiError?.status === 403) {
        toast.error('Недостаточно прав для выполнения операции');
        return;
      }

      // 5xx and network errors - throw to ErrorBoundary
      if (!apiError || apiError.status >= 500) {
        throw error;
      }

      // Other 4xx - show toast
      toast.error(
        (apiError.data as {message?: string})?.message || 'Произошла ошибка',
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: error => {
      const apiError = error instanceof ApiError ? error : null;

      // 403 - show forbidden message
      if (apiError?.status === 403) {
        toast.error('Недостаточно прав для выполнения операции');
        return;
      }

      // Other errors - show toast with message
      toast.error(
        apiError?.data
          ? (apiError.data as {message?: string})?.message
          : 'Произошла ошибка',
      );
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.PROD ? 1000 * 5 : 0,
      retry: (failureCount, error) => {
        const apiError = error instanceof ApiError ? error : null;

        // Don't retry 4xx
        if (apiError && apiError.status < 500) {
          return false;
        }

        // Retry network/5xx once
        return import.meta.env.PROD && failureCount < 1;
      },
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Outlet />
      </ErrorBoundary>
      <Toaster position="top-right" richColors />
      <Agentation />
    </QueryClientProvider>
  ),
  notFoundComponent: NotFoundPage,
});
