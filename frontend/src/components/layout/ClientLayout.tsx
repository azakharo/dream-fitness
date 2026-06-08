import {Outlet} from '@tanstack/react-router';
import {Header} from './Header';
import {BottomNav} from './BottomNav';
import {useNotificationRefresh} from '@/hooks';

export const ClientLayout: React.FC = () => {
  useNotificationRefresh();

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.01_130)]">
      <Header />

      <main
        className="
          mx-auto max-w-[1200px] p-6 pb-24
          md:pb-6
        "
      >
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};
