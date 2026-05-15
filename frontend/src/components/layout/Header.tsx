import {Link} from '@tanstack/react-router';
import {User, LogOut} from 'lucide-react';
import {useAuthStore} from '@/stores/auth-store';
import {useLogout} from '@/hooks/use-auth';
import {NotificationsBell} from './NotificationsBell';
import {TopNav} from './TopNav';
import {Button} from '@/components/ui';
import {Avatar, AvatarFallback} from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import {ROUTES} from '@/lib/routes';

export const Header: React.FC = () => {
  const {user} = useAuthStore();
  const role = user?.role ?? 'admin';
  const logoutMutation = useLogout();

  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? '?';

  return (
    <header
      className={`
        sticky top-0 z-50 flex h-14 w-full items-center
        ${role === 'admin' ? 'justify-end' : 'justify-between'}
        border-b bg-background/95 px-4 backdrop-blur-sm
        supports-backdrop-filter:bg-background/60
      `}
    >
      {/* Logo */}
      {role === 'client' && (
        <Link to={ROUTES.DASHBOARD} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">DreamFitness</span>
        </Link>
      )}

      {/* Desktop Navigation - shown only on desktop */}
      {role === 'client' && (
        <div
          className="
            hidden flex-1 justify-center
            md:flex
          "
        >
          <TopNav />
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <NotificationsBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative size-8 rounded-full">
              <Avatar className="size-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.PROFILE}>
                <User className="mr-2 size-4" />
                Профиль
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
