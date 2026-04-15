import { addMinutes } from 'date-fns';
import { hasIntersection, TrainingInterval } from './training-interval';

describe('hasIntersection', () => {
  const baseTime = new Date('2024-01-01T10:00:00Z');

  const createTraining = (
    start: Date,
    durationMinutes: number,
  ): TrainingInterval => ({
    start,
    durationMinutes,
  });

  describe('No overlap scenarios', () => {
    it('should return false when training is after all existing trainings', () => {
      const training = createTraining(addMinutes(baseTime, 120), 60);
      const otherTrainings = [
        createTraining(baseTime, 60),
        createTraining(addMinutes(baseTime, 60), 60),
      ];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(false);
    });

    it('should return false when training is before all existing trainings', () => {
      const training = createTraining(addMinutes(baseTime, 120), 60);
      const otherTrainings = [
        createTraining(baseTime, 60),
        createTraining(addMinutes(baseTime, 60), 60),
      ];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(false);
    });

    it('should return false when training ends exactly when another starts (adjacent)', () => {
      const training = createTraining(baseTime, 60);
      const otherTrainings = [createTraining(addMinutes(baseTime, 60), 60)];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(false);
    });

    it('should return false when training starts exactly when another ends (adjacent)', () => {
      const training = createTraining(addMinutes(baseTime, 60), 60);
      const otherTrainings = [createTraining(baseTime, 60)];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(false);
    });
  });

  describe('Overlap scenarios', () => {
    it('should return true when training starts during an existing training', () => {
      const training = createTraining(addMinutes(baseTime, 30), 60);
      const otherTrainings = [createTraining(baseTime, 60)];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(true);
    });

    it('should return true when training ends during an existing training', () => {
      const training = createTraining(baseTime, 30);
      const otherTrainings = [createTraining(baseTime, 60)];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(true);
    });

    it('should return true when training completely contains an existing training', () => {
      const training = createTraining(baseTime, 120);
      const otherTrainings = [createTraining(addMinutes(baseTime, 30), 60)];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(true);
    });

    it('should return true when training is completely contained by an existing training', () => {
      const training = createTraining(addMinutes(baseTime, 30), 60);
      const otherTrainings = [createTraining(baseTime, 120)];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(true);
    });

    it('should return true when training has exact same start and duration', () => {
      const training = createTraining(baseTime, 60);
      const otherTrainings = [createTraining(baseTime, 60)];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should return false when otherTrainings array is empty', () => {
      const training = createTraining(baseTime, 60);
      const otherTrainings: TrainingInterval[] = [];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(false);
    });

    it('should return true when only one training overlaps', () => {
      const training = createTraining(baseTime, 60);
      const otherTrainings = [
        createTraining(baseTime, 60),
        createTraining(addMinutes(baseTime, 120), 60),
        createTraining(addMinutes(baseTime, 240), 60),
      ];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(true);
    });

    it('should return false when none of the trainings overlap', () => {
      const training = createTraining(baseTime, 60);
      const otherTrainings = [
        createTraining(addMinutes(baseTime, 120), 60),
        createTraining(addMinutes(baseTime, 240), 60),
        createTraining(addMinutes(baseTime, 360), 60),
      ];

      const result = hasIntersection(training, otherTrainings);
      expect(result).toBe(false);
    });
  });
});
