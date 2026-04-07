export interface TrainingCreatedEvent {
  eventType: 'training.created';
  data: {
    trainingId: string;
    title: string;
    trainerId: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    price: number;
  };
}

export interface TrainingUpdatedEvent {
  eventType: 'training.updated';
  data: {
    trainingId: string;
    changes: Record<string, unknown>;
    updatedAt: string;
  };
}

export interface TrainingCancelledEvent {
  eventType: 'training.cancelled';
  data: {
    trainingId: string;
    reason?: string;
    cancelledAt: string;
    participantIds: string[];
  };
}
