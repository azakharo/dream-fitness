import { CreateTrainerDto } from '../../src/trainers/dto/create-trainer.dto';
import { CreateTrainingDto } from '../../src/trainings/dto/create-training.dto';
import { TrainingType } from '@app/shared/enums';

export const NON_EXISTENT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export function createTrainerDto(
  overrides?: Partial<CreateTrainerDto>,
): CreateTrainerDto {
  return {
    name: overrides?.name || 'John Doe',
    bio: overrides?.bio || 'Professional fitness trainer',
    avatarUrl: overrides?.avatarUrl || 'https://example.com/avatar.jpg',
  };
}

export function futureDate(daysAhead: number = 1): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString();
}

export function createTrainingDto(
  trainerId: string,
  overrides?: Partial<CreateTrainingDto>,
): CreateTrainingDto {
  const result = {
    title: overrides?.title ?? 'Morning Yoga Session',
    description: overrides?.description ?? 'A relaxing morning yoga session',
    type: overrides?.type ?? TrainingType.YOGA,
    trainerId,
    scheduledAt: overrides?.scheduledAt ?? futureDate(1),
    durationMinutes: overrides?.durationMinutes ?? 60,
    capacity: overrides?.capacity ?? 10,
    price: overrides?.price ?? 1000,
  };

  return result;
}
