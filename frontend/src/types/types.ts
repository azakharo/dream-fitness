/**
 * Domain-organized type exports from OpenAPI spec.
 * Import types directly instead of using components['schemas']['...'] syntax.
 *
 * @example
 * // Before
 * import type { components } from './api.generated';
 * type User = components['schemas']['UserProfileDto'];
 *
 * // After
 * import type { UserProfileDto } from '@/types';
 */

import type {components} from './api.generated';

// ===========================================
// Auth Domain
// ===========================================

export type RegisterDto = components['schemas']['RegisterDto'];
export type LoginDto = components['schemas']['LoginDto'];
export type LoginResponseBody = components['schemas']['LoginResponseBody'];
export type RegisterResponseBody =
  components['schemas']['RegisterResponseBody'];
export type LogoutResponseBody = components['schemas']['LogoutResponseBody'];
export type UserProfileDto = components['schemas']['UserProfileDto'];
export type BalanceResponseDto = components['schemas']['BalanceResponseDto'];
export type UpdateBalanceDto = components['schemas']['UpdateBalanceDto'];
export type TransactionResponseDto =
  components['schemas']['TransactionResponseDto'];
export type TransactionListResponseDto =
  components['schemas']['TransactionListResponseDto'];
export type Gender = RegisterDto['gender'];
export type TransactionType = TransactionResponseDto['type'];

// ===========================================
// Training Domain
// ===========================================

export type TrainerResponseDto = components['schemas']['TrainerResponseDto'];
export type CreateTrainerDto = components['schemas']['CreateTrainerDto'];
export type UpdateTrainerDto = components['schemas']['UpdateTrainerDto'];
export type TrainingResponseDto = components['schemas']['TrainingResponseDto'];
export type TrainingListResponseDto =
  components['schemas']['TrainingListResponseDto'];
export type CreateTrainingDto = components['schemas']['CreateTrainingDto'];
export type UpdateTrainingDto = components['schemas']['UpdateTrainingDto'];
export type TrainingType = TrainingResponseDto['type'];
export type TrainingStatus = TrainingResponseDto['status'];

// ===========================================
// Booking Domain
// ===========================================

export type BookingResponseDto = components['schemas']['BookingResponseDto'];
export type BookingListResponseDto =
  components['schemas']['BookingListResponseDto'];
export type BookingDto = components['schemas']['BookingDto'];
export type CreateBookingDto = components['schemas']['CreateBookingDto'];
export type CancelBookingDto = components['schemas']['CancelBookingDto'];
export type WaitlistResponseDto = components['schemas']['WaitlistResponseDto'];
export type WaitlistDto = components['schemas']['WaitlistDto'];
export type JoinWaitlistDto = components['schemas']['JoinWaitlistDto'];
export type BookingStatus = BookingDto['status'];
export type TrainingBookingCountDto =
  components['schemas']['TrainingBookingCountDto'];

// ===========================================
// Notification Domain
// ===========================================

export type NotificationResponseDto =
  components['schemas']['NotificationResponseDto'];
export type NotificationListResponseDto =
  components['schemas']['NotificationListResponseDto'];
export type UnreadCountResponseDto =
  components['schemas']['UnreadCountResponseDto'];
export type NotificationDto = components['schemas']['NotificationDto'];
export type NotificationType = NotificationDto['type'];

// ===========================================
// User Domain
// ===========================================

export type UserDto = components['schemas']['UserDto'];
export type UserListResponseDto = components['schemas']['UserListResponseDto'];
export type UpdateUserStatusDto = components['schemas']['UpdateUserStatusDto'];
export type UserRole = 'client' | 'admin';
export type UserStatus = UserDto['status'];
