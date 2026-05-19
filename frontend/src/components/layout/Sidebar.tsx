import {Link, useLocation} from '@tanstack/react-router';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Dumbbell,
  ChevronDown,
  ChevronRight,
  Menu,
} from 'lucide-react';
import {useState} from 'react';
import {ROUTES} from '@/lib/routes';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui';
import {useUIStore} from '@/stores/ui-store';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{className?: string}>;
  children?: {label: string; href: string}[];
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {label: 'Dashboard', href: ROUTES.ADMIN_ROOT, icon: LayoutDashboard},
  {
    label: 'Расписание',
    icon: Calendar,
    children: [
      {label: 'Список тренировок', href: ROUTES.ADMIN_SCHEDULE},
      {label: 'Создать тренировку', href: ROUTES.ADMIN_SCHEDULE_NEW},
    ],
  },
  {label: 'Тренеры', href: ROUTES.ADMIN_TRAINERS, icon: Dumbbell},
  {label: 'Пользователи', href: ROUTES.USERS, icon: Users},
  {label: 'Отчёты', href: ROUTES.REPORTS, icon: BarChart3},
];

const SidebarNavItem: React.FC<{item: NavItem}> = ({item}) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  const isGroupActive =
    hasChildren &&
    item.children!.some(
      child =>
        location.pathname === child.href ||
        location.pathname.startsWith(child.href + '/'),
    );

  const [isOpen, setIsOpen] = useState(isGroupActive);

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            `
              flex w-full cursor-pointer items-center justify-between rounded-md
              px-3 py-2 text-sm transition-colors
            `,
            isGroupActive ? '' : 'hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
        {isOpen && (
          <div className="mt-1 ml-6 space-y-1">
            {item.children!.map(child => (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  location.pathname === child.href
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href}
      className={cn(
        `
          flex items-center space-x-3 rounded-md px-3 py-2 text-sm
          transition-colors
        `,
        location.pathname === item.href
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <item.icon className="size-4" />
      <span>{item.label}</span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const {sidebarOpen, toggleSidebar} = useUIStore();

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="
          fixed top-4 left-4 z-50
          md:hidden
        "
        onClick={toggleSidebar}
      >
        <Menu className="size-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          `
            fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background
            transition-transform duration-200 ease-in-out
          `,
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <Link
              to={ROUTES.ADMIN_ROOT}
              className="flex items-center space-x-2"
            >
              <span className="text-xl font-bold text-primary">
                DreamFitness Admin UI
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {ADMIN_NAV_ITEMS.map(item => (
              <SidebarNavItem key={item.label} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="
            fixed inset-0 z-30 bg-black/50
            md:hidden
          "
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
};
