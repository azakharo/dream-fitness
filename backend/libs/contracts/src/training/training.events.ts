export interface TrainingCreatedEvent {
  eventId: string;
  eventType: 'training.created';
  timestamp: string;
  data: {
    trainingId: string;
    title: string;
    type: string;
    trainerId: string;
    scheduledAt: string;
    durationMinutes: number;
    capacity: number;
    price: number;
  };
}

export interface TrainingUpdatedEvent {
  eventId: string;
  eventType: 'training.updated';
  timestamp: string;
  data: {
    trainingId: string;
    changes: Record<string, unknown>;
    updatedAt: string;
  };
}

export interface TrainingCancelledEvent {
  eventId: string;
  eventType: 'training.cancelled';
  timestamp: string;
  data: {
    trainingId: string;
    reason?: string;
    cancelledAt: string;
  };
}
