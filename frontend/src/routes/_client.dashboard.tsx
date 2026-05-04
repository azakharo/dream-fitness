import {createFileRoute} from '@tanstack/react-router';

const DashboardPage = () => {
  return <div>Dashboard</div>;
};

export const Route = createFileRoute('/_client/dashboard')({
  component: DashboardPage,
});
