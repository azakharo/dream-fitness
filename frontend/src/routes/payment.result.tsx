import {PaymentResultPage} from '@/pages/payment/PaymentResultPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/payment/result')({
  component: PaymentResultPage,
});
