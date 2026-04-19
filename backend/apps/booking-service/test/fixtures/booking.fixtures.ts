export const TEST_TRAINING = {
  id: 'a0000000-0000-0000-0000-000000000001',
  title: 'Test Training',
  type: 'yoga',
  trainerId: 'b0000000-0000-0000-0000-000000000001',
  scheduledAt: '2026-06-20T10:00:00.000Z',
  durationMinutes: 60,
  capacity: 10,
  price: 500,
};

export const TEST_TRAINING_FULL = {
  ...TEST_TRAINING,
  id: 'a0000000-0000-0000-0000-000000000002',
  capacity: 1,
  title: 'Full Training',
};

export function createTrainingMock(overrides?: Partial<typeof TEST_TRAINING>) {
  return { ...TEST_TRAINING, ...overrides };
}

export function createAvailabilityMock(overrides?: {
  trainingId?: string;
  capacity?: number;
  currentParticipants?: number;
  availableSlots?: number;
  isAvailable?: boolean;
}) {
  return {
    trainingId: TEST_TRAINING.id,
    capacity: 10,
    currentParticipants: 0,
    availableSlots: 10,
    isAvailable: true,
    ...overrides,
  };
}
