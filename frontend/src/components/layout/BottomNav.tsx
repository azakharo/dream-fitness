import {Link, useLocation} from '@tanstack/react-router';
import {LayoutDashboard, Calendar, Clock, User} from 'lucide-react';
import {ROUTES} from '@/lib/routes';
import {cn} from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{className?: string}>;
}

const NAV_ITEMS: NavItem[] = [
  {label: 'Главная', href: ROUTES.DASHBOARD, icon: LayoutDashboard},
  {label: 'Расписание', href: ROUTES.SCHEDULE, icon: Calendar},
  {label: 'История', href: ROUTES.HISTORY, icon: Clock},
  {label: 'Профиль', href: ROUTES.PROFILE, icon: User},
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-50 border-t border-[oklch(0.90_0.01_130)]
        bg-background/95 backdrop-blur-sm
        md:hidden
        dark:border-[oklch(0.30_0.02_130)]
      "
    >
      <div className="flex h-16 items-center justify-around">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                `
                  flex h-full flex-1 flex-col items-center justify-center
                  transition-colors
                `,
                isActive
                  ? 'text-[oklch(0.35_0.12_130)]'
                  : `
                    text-muted-foreground
                    hover:text-[oklch(0.68_0.22_130)]
                  `,
              )}
            >
              <item.icon className="size-5" />
              <span className="mt-1 text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
