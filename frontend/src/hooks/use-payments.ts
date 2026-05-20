import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import {paymentsKeys, balanceKeys, transactionsKeys} from '@/lib/query-keys';
import type {
  InitPaymentDto,
  InitPaymentResponseDto,
  PaymentStatusResponseDto,
  PaymentHistoryResponseDto,
} from '@/types';

export const useInitPayment = () => {
  return useMutation({
    mutationFn: (data: InitPaymentDto) =>
      api.post<InitPaymentResponseDto>('/payments/init', data),
  });
};

export const usePaymentStatus = (paymentId: string) => {
  return useQuery({
    queryKey: paymentsKeys.status(paymentId),
    queryFn: () =>
      api.get<PaymentStatusResponseDto>(`/payments/${paymentId}/status`),
    enabled: !!paymentId,
  });
};

export const usePaymentHistory = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: paymentsKeys.history(page, limit),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page !== undefined) params.set('page', String(page));
      if (limit !== undefined) params.set('limit', String(limit));

      const queryString = params.toString();
      const endpoint = queryString ? `/payments?${queryString}` : '/payments';
      return api.get<PaymentHistoryResponseDto>(endpoint);
    },
  });
};

export const useRefreshBalance = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({queryKey: balanceKeys.all()});
    void queryClient.invalidateQueries({queryKey: transactionsKeys.all()});
  };
};
