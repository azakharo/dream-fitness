export const TEST_TRAINING = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Test Training',
  type: 'yoga',
  trainerId: '22222222-2222-2222-2222-222222222222',
  scheduledAt: '2026-06-20T10:00:00.000Z',
  durationMinutes: 60,
  capacity: 10,
  price: 500,
};

export const TEST_TRAINING_FULL = {
  ...TEST_TRAINING,
  id: '33333333-3333-3333-3333-333333333333',
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
