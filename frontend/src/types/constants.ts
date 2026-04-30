import type {
  BookingStatus,
  Gender,
  NotificationType,
  TrainingStatus,
  TrainingType,
  TransactionType,
} from './types';

export const GENDERS: Gender[] = ['male', 'female'];

export const GENDER_OPTIONS = GENDERS.map(gender => ({
  value: gender,
  label: gender!.charAt(0).toUpperCase() + gender!.slice(1),
}));

export const TRAINING_TYPES: TrainingType[] = [
  'yoga',
  'pilates',
  'crossfit',
  'boxing',
  'strength',
  'cardio',
  'dance',
  'stretching',
];

export const TRAINING_TYPE_OPTIONS = TRAINING_TYPES.map(type => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

export const TRAINING_STATUSES: TrainingStatus[] = [
  'scheduled',
  'cancelled',
  'completed',
];

export const TRAINING_STATUS_OPTIONS = TRAINING_STATUSES.map(status => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

export const TRANSACTION_TYPES: TransactionType[] = [
  'deposit',
  'withdraw',
  'refund',
  'reserve',
  'release',
];

export const TRANSACTION_TYPE_OPTIONS = TRANSACTION_TYPES.map(type => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

export const BOOKING_STATUSES: BookingStatus[] = [
  'confirmed',
  'cancelled',
  'completed',
];

export const BOOKING_STATUS_OPTIONS = BOOKING_STATUSES.map(status => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

export const NOTIFICATION_TYPES: NotificationType[] = [
  'booking_confirmation',
  'booking_cancellation',
  'balance_change',
  'training_reminder',
  'waitlist_joined',
  'waitlist_promoted',
];

export const NOTIFICATION_TYPE_OPTIONS = NOTIFICATION_TYPES.map(type => ({
  value: type,
  label: type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '),
}));
