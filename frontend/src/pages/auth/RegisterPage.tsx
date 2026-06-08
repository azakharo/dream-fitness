import {Link} from '@tanstack/react-router';
import {Dumbbell, Calendar, Trophy, Users} from 'lucide-react';
import {RegisterForm} from '@/components/auth/RegisterForm';
import {Logo} from '@/components/common/Logo';
import {MotivationBanner} from '@/components/common/MotivationBanner';
import {ROUTES} from '@/lib/routes';

export const RegisterPage: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Hero Section - Hidden on mobile */}
      <div
        className="
          hidden w-[45%] bg-linear-to-br from-[oklch(0.75_0.22_125)]
          to-[oklch(0.65_0.20_135)]
          lg:flex lg:flex-col lg:p-10
        "
      >
        <div className="mb-8">
          <Logo size="sm" />
        </div>

        {/* Running person illustration placeholder */}
        <div className="relative my-8 flex flex-1 items-center justify-center">
          <div className="size-48 rounded-full bg-white/10" />
          <div className="absolute text-white/30">
            <Dumbbell className="size-24" />
          </div>
        </div>

        <div className="max-w-sm text-white">
          <h1 className="mb-4 text-3xl font-bold">
            Начни путь к лучшей версии себя
          </h1>
          <p className="mb-8 text-white/90">
            DreamFitness — это больше, чем фитнес-клуб. Это сообщество людей,
            стремящихся к здоровому образу жизни.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex size-10 items-center justify-center rounded-full
                  bg-white/20
                "
              >
                <Calendar className="size-5" />
              </div>
              <span className="text-sm">Гибкое расписание тренировок</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="
                  flex size-10 items-center justify-center rounded-full
                  bg-white/20
                "
              >
                <Trophy className="size-5" />
              </div>
              <span className="text-sm">Профессиональные тренеры</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="
                  flex size-10 items-center justify-center rounded-full
                  bg-white/20
                "
              >
                <Users className="size-5" />
              </div>
              <span className="text-sm">Дружелюбное сообщество</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div
        className="
          flex w-full flex-col items-center justify-center
          bg-[oklch(0.98_0.01_130)] px-6 py-12
          lg:w-[55%]
        "
      >
        <div className="w-full max-w-md space-y-6">
          {/* Header with Logo */}
          <div className="mb-6 flex flex-col items-center">
            <Logo size="md" />
            <h2 className="mt-4 text-2xl font-bold text-[oklch(0.15_0.02_130)]">
              Создай аккаунт
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Заполни форму и начни тренироваться
            </p>
          </div>

          {/* Register Form */}
          <div
            className="
              rounded-xl border border-[oklch(0.90_0.01_130)] bg-card p-6
              shadow-sm
              dark:border-[oklch(0.30_0.02_130)]
            "
          >
            <RegisterForm />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm">
            Уже есть аккаунт?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="
                font-medium text-[oklch(0.68_0.22_130)]
                hover:text-[oklch(0.55_0.20_135)]
              "
            >
              Войти
            </Link>
          </p>

          {/* Motivation Banner */}
          <MotivationBanner
            title="Начни сегодня!"
            description="Первые 7 дней — бесплатно. Попробуй все виды тренировок."
            icon={<Trophy />}
          />
        </div>
      </div>
    </div>
  );
};
