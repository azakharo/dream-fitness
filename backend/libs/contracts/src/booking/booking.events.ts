export interface BookingCreatedEvent {
  eventType: 'booking.created';
  data: {
    bookingId: string;
    trainingId: string;
    userId: string;
    bookedAt: string;
  };
}

export interface BookingCancelledEvent {
  eventType: 'booking.cancelled';
  data: {
    bookingId: string;
    trainingId: string;
    userId: string;
    reason?: string;
    cancelledAt: string;
  };
}

export interface WaitlistJoinedEvent {
  eventType: 'waitlist.joined';
  data: {
    waitlistId: string;
    trainingId: string;
    userId: string;
    position: number;
    joinedAt: string;
  };
}

export interface WaitlistPromotedEvent {
  eventType: 'waitlist.promoted';
  data: {
    waitlistId: string;
    trainingId: string;
    userId: string;
    promotedAt: string;
  };
}
