import { addMinutes } from 'date-fns';

export interface TrainingInterval {
  start: Date;
  durationMinutes: number;
}

export const hasIntersection = (
  training: TrainingInterval,
  otherTrainings: TrainingInterval[],
): boolean => {
  const trainingEnd = addMinutes(training.start, training.durationMinutes);

  return otherTrainings.some((other) => {
    const otherEnd = addMinutes(other.start, other.durationMinutes);
    return training.start < otherEnd && other.start < trainingEnd;
  });
};
