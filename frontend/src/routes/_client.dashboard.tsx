import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_client/dashboard')({
  component: DashboardPage,
});

const DashboardPage = () => {
  return <div>Dashboard</div>;
};
