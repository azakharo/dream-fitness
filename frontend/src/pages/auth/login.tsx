import {Link} from '@tanstack/react-router';
import {LoginForm} from '@/components/auth/login-form';
import {ROUTES} from '@/lib/routes';

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm">
          Нет аккаунта?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};
