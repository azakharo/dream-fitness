import {useQuery} from '@tanstack/react-query';

export interface LoadingStatsData {
  totalTrainings: number;
  bookedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  dateFrom: string;
  dateTo: string;
}

export interface PopularTrainingData {
  trainingId: string;
  title: string;
  type: string;
  bookingCount: number;
  revenue: number;
}

export interface FinancialReportData {
  totalRevenue: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
  dateFrom: string;
  dateTo: string;
}

const generateMockLoadingStats = (
  dateFrom?: Date,
  dateTo?: Date,
): LoadingStatsData => {
  const from = dateFrom ? dateFrom.toISOString().split('T')[0] : '2024-01-01';
  const to = dateTo ? dateTo.toISOString().split('T')[0] : '2024-01-31';

  return {
    totalTrainings: 45,
    bookedSlots: 380,
    availableSlots: 520,
    occupancyRate: 73.2,
    dateFrom: from,
    dateTo: to,
  };
};

const generateMockPopularTrainings = (
  limit?: number,
): PopularTrainingData[] => {
  const trainings: PopularTrainingData[] = [
    {
      trainingId: '1',
      title: 'Morning Yoga',
      type: 'yoga',
      bookingCount: 128,
      revenue: 64000,
    },
    {
      trainingId: '2',
      title: 'CrossFit Workout',
      type: 'crossfit',
      bookingCount: 95,
      revenue: 47500,
    },
    {
      trainingId: '3',
      title: 'Pilates Core',
      type: 'pilates',
      bookingCount: 82,
      revenue: 41000,
    },
    {
      trainingId: '4',
      title: 'Boxing Cardio',
      type: 'boxing',
      bookingCount: 78,
      revenue: 39000,
    },
    {
      trainingId: '5',
      title: 'Dance Fitness',
      type: 'dance',
      bookingCount: 65,
      revenue: 32500,
    },
  ];

  return trainings.slice(0, limit ?? 5);
};

const generateMockFinancialReport = (
  dateFrom: Date,
  dateTo: Date,
): FinancialReportData => {
  const from = dateFrom.toISOString().split('T')[0];
  const to = dateTo.toISOString().split('T')[0];

  return {
    totalRevenue: 224000,
    totalDeposits: 180000,
    totalWithdrawals: 45000,
    totalRefunds: 11000,
    netRevenue: 124000,
    transactionCount: 456,
    dateFrom: from,
    dateTo: to,
  };
};

export const useLoadingStats = (dateFrom?: Date, dateTo?: Date) => {
  return useQuery({
    queryKey: [
      'reports',
      'loading',
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ],
    queryFn: () => Promise.resolve(generateMockLoadingStats(dateFrom, dateTo)),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePopularTrainings = (limit?: number) => {
  return useQuery({
    queryKey: ['reports', 'popular-trainings', limit],
    queryFn: () => Promise.resolve(generateMockPopularTrainings(limit)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinancialReport = (dateFrom: Date, dateTo: Date) => {
  return useQuery({
    queryKey: [
      'reports',
      'financial',
      dateFrom.toISOString(),
      dateTo.toISOString(),
    ],
    queryFn: () =>
      Promise.resolve(generateMockFinancialReport(dateFrom, dateTo)),
    enabled: !!dateFrom && !!dateTo,
    staleTime: 5 * 60 * 1000,
  });
};
