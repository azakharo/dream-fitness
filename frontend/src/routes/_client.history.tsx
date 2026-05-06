import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_client/history')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_client/history"!</div>;
}
