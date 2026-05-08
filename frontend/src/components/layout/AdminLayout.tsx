import {Outlet} from '@tanstack/react-router';
import {Sidebar} from './Sidebar';
import {Header} from './Header';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="md:pl-64">
        <Header />
        <main className="container px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
