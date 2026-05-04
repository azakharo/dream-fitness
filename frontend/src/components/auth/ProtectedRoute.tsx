import {Navigate} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {ROUTES} from '@/lib/routes';
import type {UserRole} from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const {user, isLoading, accessToken} = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="
            size-8 animate-spin rounded-full border-4 border-primary
            border-t-transparent
          "
        />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.UNAUTHORIZED} />;
  }

  return <>{children}</>;
};
