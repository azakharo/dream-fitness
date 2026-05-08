import {useMemo} from 'react';
import type {TrainingResponseDto, WaitlistResponseDto} from '@/types';
import {useWaitlist} from './use-waitlist';
import {useTrainingsByIds} from './use-trainings-by-ids';

export interface EnrichedWaitlist extends WaitlistResponseDto {
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

export const useEnrichedWaitlist = () => {
  const {data: waitlistData, isLoading: isWaitlistLoading} = useWaitlist();

  const trainingIds = useMemo(() => {
    if (!waitlistData) return [];
    return waitlistData.map(w => w.trainingId);
  }, [waitlistData]);

  const {data: trainingsMap, isLoading: isTrainingsLoading} =
    useTrainingsByIds(trainingIds);

  const enrichedWaitlist = useMemo(() => {
    if (!waitlistData) return [];
    return waitlistData.map(waitlist => {
      const training = trainingsMap?.get(waitlist.trainingId);
      return {
        ...waitlist,
        trainingTitle: training?.title || 'Тренировка',
        trainingType: training?.type || 'yoga',
        scheduledAt: training?.scheduledAt || waitlist.joinedAt,
        durationMinutes: training?.durationMinutes || 60,
        trainerName: training?.trainerName,
        trainerId: training?.trainerId || '',
        price: training?.price || 0,
        capacity: training?.capacity || 0,
        currentParticipants: training?.currentParticipants || 0,
        availableSlots: training?.availableSlots || 0,
      } as EnrichedWaitlist;
    });
  }, [waitlistData, trainingsMap]);

  return {
    data: enrichedWaitlist,
    isLoading: isWaitlistLoading || isTrainingsLoading,
  };
};
