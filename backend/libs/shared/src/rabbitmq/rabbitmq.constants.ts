// Exchange names
export const EXCHANGES = {
  MAIN: 'dreamfitness.exchange',
} as const;

// Routing key patterns
export const ROUTING_KEYS = {
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',

  // Balance events
  BALANCE_CHANGED: 'balance.changed',
  BALANCE_RESERVED: 'balance.reserved',
  BALANCE_RELEASED: 'balance.released',

  // Training events
  TRAINING_CREATED: 'training.created',
  TRAINING_UPDATED: 'training.updated',
  TRAINING_CANCELLED: 'training.cancelled',
  TRAINING_REMINDER: 'training.reminder',

  // Booking events
  BOOKING_CREATED: 'booking.created',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_COMPLETED: 'booking.completed',

  // Waitlist events
  WAITLIST_JOINED: 'waitlist.joined',
  WAITLIST_PROMOTED: 'waitlist.promoted',
  WAITLIST_LEFT: 'waitlist.left',

  // Notification events
  NOTIFICATION_CREATED: 'notification.created',
} as const;

// Queue names for each service
export const QUEUES = {
  // Auth service listens to
  AUTH_SERVICE: 'auth.service.queue',

  // Training service listens to
  TRAINING_SERVICE: 'training.service.queue',

  // Booking service listens to
  BOOKING_SERVICE: 'booking.service.queue',

  // Notification service listens to all events
  NOTIFICATION_SERVICE: 'notification.service.queue',
} as const;
