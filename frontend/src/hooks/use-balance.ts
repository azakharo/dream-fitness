import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import {balanceKeys, transactionsKeys} from '@/lib/query-keys';
import type {
  BalanceResponseDto,
  TransactionListResponseDto,
  UpdateBalanceDto,
} from '@/types';

export interface TransactionFilters {
  type?: string;
  fromDate?: Date;
  toDate?: Date;
}

export const useBalance = () => {
  return useQuery({
    queryKey: balanceKeys.all(),
    queryFn: () => api.get<BalanceResponseDto>('/auth/balance'),
  });
};

export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: transactionsKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.set('type', filters.type);
      if (filters?.fromDate)
        params.set('fromDate', filters.fromDate.toISOString().split('T')[0]);
      if (filters?.toDate)
        params.set('toDate', filters.toDate.toISOString().split('T')[0]);

      const queryString = params.toString();
      const endpoint = queryString
        ? `/auth/transactions?${queryString}`
        : '/auth/transactions';
      return api.get<TransactionListResponseDto>(endpoint);
    },
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBalanceDto) =>
      api.post<BalanceResponseDto>('/auth/balance/deposit', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: balanceKeys.all()});
      void queryClient.invalidateQueries({queryKey: transactionsKeys.all()});
    },
  });
};
