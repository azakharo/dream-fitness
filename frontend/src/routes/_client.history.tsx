import {createFileRoute} from '@tanstack/react-router';
import {HistoryPage} from '@/pages/client/HistoryPage';

export const Route = createFileRoute('/_client/history')({
  component: HistoryPage,
});
