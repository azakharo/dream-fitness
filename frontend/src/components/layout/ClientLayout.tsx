import {Outlet} from '@tanstack/react-router';
import {Header} from './Header';
import {BottomNav} from './BottomNav';
import {useNotificationRefresh} from '@/hooks';

export const ClientLayout: React.FC = () => {
  useNotificationRefresh();

  return (
    <div className="min-h-screen bg-background">
      {/* Header includes TopNav for desktop */}
      <Header />

      {/* Main content area */}
      <main
        className="
          container px-4 py-6 pb-20
          md:pb-6
        "
      >
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
};
