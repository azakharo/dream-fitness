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

export const TopNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-6">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              `
                flex items-center space-x-2 text-sm font-medium
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
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
