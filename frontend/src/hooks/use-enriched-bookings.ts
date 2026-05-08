import {useMemo} from 'react';
import type {BookingResponseDto, TrainingResponseDto} from '@/types';
import {useBookings, type BookingFilters} from './use-bookings';
import {useTrainingsByIds} from './use-trainings-by-ids';
import {isDateAfter, isDateBefore, parseApiDate} from '@/lib/date-utils';

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
  const {data: bookingsData, isLoading: isBookingsLoading} = useBookings();

  const trainingIds = useMemo(() => {
    if (!bookingsData?.items) return [];
    return bookingsData.items.map(b => b.trainingId);
  }, [bookingsData]);

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
  }, [bookingsData, trainingsMap]);

  const filteredBookings = useMemo(() => {
    if (!enrichedBookings) return [];
    if (!filters) return enrichedBookings;

    const now = new Date();

    return enrichedBookings.filter(booking => {
      // Filter by status
      if (filters.status && booking.status !== filters.status) {
        return false;
      }

      // Filter by upcoming (training scheduled in the future)
      if (filters.upcoming) {
        const scheduledAt = parseApiDate(booking.scheduledAt);
        if (!isDateAfter(scheduledAt, now)) {
          return false;
        }
      }

      // Filter by past (training already completed)
      if (filters.past) {
        const scheduledAt = parseApiDate(booking.scheduledAt);
        if (!isDateBefore(scheduledAt, now)) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedBookings, filters]);

  return {
    data: filteredBookings,
    total: filteredBookings.length,
    isLoading: isBookingsLoading || isTrainingsLoading,
  };
};
