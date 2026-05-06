import {useMemo} from 'react';
import type {BookingResponseDto, TrainingResponseDto} from '@/types';
import {useBookings, type BookingFilters} from './use-bookings';
import {useTrainingsByIds} from './use-trainings-by-ids';

export interface EnrichedBooking extends BookingResponseDto {
  trainingTitle: string;
  trainingType: TrainingResponseDto['type'];
  scheduledAt: string;
  durationMinutes: number;
  trainerName?: string;
  trainerId: string;
  price: number;
  capacity: number;
  currentParticipants: number;
  availableSlots: number;
}

export const useEnrichedBookings = (filters?: BookingFilters) => {
  const {data: bookingsData, isLoading: isBookingsLoading} =
    useBookings(filters);

  const trainingIds = useMemo(() => {
    if (!bookingsData?.items) return [];
    return bookingsData.items.map(b => b.trainingId);
  }, [bookingsData?.items]);

  const {data: trainingsMap, isLoading: isTrainingsLoading} =
    useTrainingsByIds(trainingIds);

  const enrichedBookings = useMemo(() => {
    if (!bookingsData?.items) return [];
    return bookingsData.items.map(booking => {
      const training = trainingsMap?.get(booking.trainingId);
      return {
        ...booking,
        trainingTitle: training?.title || 'Тренировка',
        trainingType: training?.type || 'yoga',
        scheduledAt: training?.scheduledAt || booking.createdAt,
        durationMinutes: training?.durationMinutes || 60,
        trainerName: training?.trainerName,
        trainerId: training?.trainerId || '',
        price: training?.price || 0,
        capacity: training?.capacity || 0,
        currentParticipants: training?.currentParticipants || 0,
        availableSlots: training?.availableSlots || 0,
      } as EnrichedBooking;
    });
  }, [bookingsData?.items, trainingsMap]);

  return {
    data: enrichedBookings,
    total: bookingsData?.total || 0,
    isLoading: isBookingsLoading || isTrainingsLoading,
  };
};
