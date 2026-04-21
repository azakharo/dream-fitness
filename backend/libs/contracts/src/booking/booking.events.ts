export interface BookingCreatedEvent {
  eventType: 'booking.created';
  data: {
    bookingId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    bookedAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  };
}

export interface BookingCancelledEvent {
  eventType: 'booking.cancelled';
  data: {
    bookingId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    reason?: string;
    cancelledAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  };
}

export interface WaitlistJoinedEvent {
  eventType: 'waitlist.joined';
  data: {
    waitlistId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    position: number;
    joinedAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  };
}

export interface WaitlistPromotedEvent {
  eventType: 'waitlist.promoted';
  data: {
    waitlistId: string;
    trainingId: string;
    userId: string;
    userEmail: string;
    userName: string;
    promotedAt: string;
    trainingName: string;
    trainingDateTime: string;
    trainerName: string;
  };
}
