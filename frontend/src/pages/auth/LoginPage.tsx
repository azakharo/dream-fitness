import {Link} from '@tanstack/react-router';
import {Lightbulb} from 'lucide-react';
import {LoginForm} from '@/components/auth/LoginForm';
import {Logo} from '@/components/common/Logo';
import {TipCard} from '@/components/common/TipCard';
import {ROUTES} from '@/lib/routes';

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Hero Section - Hidden on mobile */}
      <div
        className="
          hidden w-1/2 bg-linear-to-br from-[oklch(0.75_0.22_125)]
          to-[oklch(0.65_0.20_135)]
          lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12
        "
      >
        <div className="max-w-md text-center text-white">
          <div className="mb-8 flex justify-center">
            <div
              className="
                flex size-[220px] items-center justify-center rounded-full
                bg-white/20 backdrop-blur-sm
              "
            >
              <Logo size="lg" showText={false} />
            </div>
          </div>
          <h1 className="mb-4 text-4xl/tight font-bold">
            Достигни своих фитнес-целей
          </h1>
          <p className="mb-8 text-lg text-white/90">
            Присоединяйся к лучшему фитнес-клубу города. Тренируйся с
            профессиональными тренерами и достигай результатов.
          </p>
          <div className="flex justify-center gap-8 text-sm font-medium">
            <div>
              <div className="text-2xl font-bold">50+</div>
              <div className="text-white/80">Тренировок</div>
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-white/80">Тренеров</div>
            </div>
            <div>
              <div className="text-2xl font-bold">2000+</div>
              <div className="text-white/80">Клиентов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div
        className="
          flex w-full flex-col items-center justify-center
          bg-[oklch(0.98_0.01_130)] px-6 py-12
          lg:w-1/2
        "
      >
        <div className="w-full max-w-md space-y-6">
          {/* Header with Logo */}
          <div className="mb-8 flex flex-col items-center">
            <Logo size="md" />
            <h2 className="mt-4 text-2xl font-bold text-[oklch(0.15_0.02_130)]">
              С возвращением!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Войдите в свой аккаунт DreamFitness
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Register Link */}
          <p className="text-center text-sm">
            Нет аккаунта?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="
                font-medium text-[oklch(0.68_0.22_130)]
                hover:text-[oklch(0.55_0.20_135)]
              "
            >
              Зарегистрироваться
            </Link>
          </p>

          {/* Tip Card */}
          <TipCard
            title="Совет дня"
            text="Регулярные тренировки улучшают не только физическую форму, но и настроение!"
            icon={<Lightbulb />}
          />
        </div>
      </div>
    </div>
  );
};
