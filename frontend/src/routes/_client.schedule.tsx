import {SchedulePage} from '@/pages/client/SchedulePage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_client/schedule')({
  component: SchedulePage,
});
