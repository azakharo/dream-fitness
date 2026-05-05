import {BookingPage} from '@/pages/client/BookingPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_client/booking/$id')({
  component: BookingPage,
});
