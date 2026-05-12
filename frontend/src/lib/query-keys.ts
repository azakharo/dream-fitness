/**
 * Query Key Factory for TanStack Query
 *
 * Centralized management of all query keys with hierarchical structure.
 * This pattern provides:
 * - Single source of truth for all query keys
 * - Type-safe key generation with TypeScript
 * - Hierarchical invalidation support
 * - Easy refactoring (change in one place)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */

import {formatDateKey} from '@/lib/date-utils';

// Filter types for query keys
export interface BookingFilters {
  status?: string;
  upcoming?: boolean;
  past?: boolean;
}

export interface TransactionFilters {
  type?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface TrainingFilters {
  type?: string;
  trainerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

// ============================================================================
// Bookings Keys
// ============================================================================

export const bookingsKeys = {
  all: () => ['bookings'] as const,
  lists: () => [...bookingsKeys.all(), 'list'] as const,
  list: (filters?: BookingFilters) =>
    [...bookingsKeys.lists(), filters] as const,
  details: () => [...bookingsKeys.all(), 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
};

// ============================================================================
// Trainings Keys
// ============================================================================

export const trainingsKeys = {
  all: () => ['trainings'] as const,
  lists: () => [...trainingsKeys.all(), 'list'] as const,
  list: (filters?: TrainingFilters) =>
    [...trainingsKeys.lists(), filters] as const,
  details: () => [...trainingsKeys.all(), 'detail'] as const,
  detail: (id: string) => [...trainingsKeys.details(), id] as const,
};

// ============================================================================
// Trainers Keys
// ============================================================================

export const trainersKeys = {
  all: () => ['trainers'] as const,
  list: () => [...trainersKeys.all(), 'list'] as const,
};

// ============================================================================
// Schedule Keys
// ============================================================================

export const scheduleKeys = {
  all: () => ['schedule'] as const,
  byDate: (date?: Date) =>
    date
      ? ([...scheduleKeys.all(), formatDateKey(date)] as const)
      : scheduleKeys.all(),
};

// ============================================================================
// Balance Keys
// ============================================================================

export const balanceKeys = {
  all: () => ['balance'] as const,
};

// ============================================================================
// Transactions Keys
// ============================================================================

export const transactionsKeys = {
  all: () => ['transactions'] as const,
  list: (filters?: TransactionFilters) =>
    [...transactionsKeys.all(), 'list', filters] as const,
};

// ============================================================================
// Notifications Keys
// ============================================================================

export const notificationsKeys = {
  all: () => ['notifications'] as const,
  lists: () => [...notificationsKeys.all(), 'list'] as const,
  list: (limit?: number) => [...notificationsKeys.lists(), limit] as const,
  unreadCount: () => [...notificationsKeys.all(), 'unread-count'] as const,
};

// ============================================================================
// Waitlist Keys
// ============================================================================

export const waitlistKeys = {
  all: () => ['waitlist'] as const,
  lists: () => [...waitlistKeys.all(), 'list'] as const,
  detail: (trainingId: string) =>
    [...waitlistKeys.all(), 'detail', trainingId] as const,
};

// ============================================================================
// Profile Keys
// ============================================================================

export const profileKeys = {
  all: () => ['profile'] as const,
};
