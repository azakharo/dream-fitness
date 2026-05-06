/**
 * Date and time utility functions for the DreamFitness frontend.
 * All date formatting and manipulation should go through these functions
 * to ensure consistency across the application.
 */

import {
  format,
  formatDistanceToNow,
  startOfWeek,
  addWeeks,
  addMinutes,
  isSameDay,
  isToday,
  isAfter,
  isBefore,
  compareAsc,
  compareDesc,
  parseISO,
  intervalToDuration,
} from 'date-fns';
import {ru} from 'date-fns/locale';

import {DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT} from './constants';

// --- Parsing ---

/**
 * Parse ISO date string from API to Date object.
 * Use this when receiving dates from the backend.
 */
export const parseApiDate = (dateString: string): Date => parseISO(dateString);

// --- Formatting ---

/**
 * Format date using the standard DATE_FORMAT (dd.MM.yyyy)
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return format(d, DATE_FORMAT, {locale: ru});
};

/**
 * Format date with short month name (e.g., "1 янв.")
 */
export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return format(d, 'd MMM', {locale: ru});
};

/**
 * Format date with full month name (e.g., "1 января 2024")
 */
export const formatDateLong = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return format(d, 'd MMMM yyyy', {locale: ru});
};

/**
 * Format month and year (e.g., "январь 2024")
 */
export const formatMonthYear = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return format(d, 'LLLL yyyy', {locale: ru});
};

/**
 * Format time using TIME_FORMAT (HH:mm)
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return format(d, TIME_FORMAT, {locale: ru});
};

/**
 * Format date and time together using DATETIME_FORMAT
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return format(d, DATETIME_FORMAT, {locale: ru});
};

/**
 * Format duration in minutes to human-readable string
 * e.g., 90 -> "1 ч 30 мин"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const duration = intervalToDuration({start: 0, end: minutes * 60 * 1000});
  const hours = duration.hours ?? 0;
  const mins = duration.minutes ?? 0;
  if (mins === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${mins} мин`;
};

/**
 * Format relative time with Russian localization
 * e.g., "5 мин. назад", "вчера", "3 дн. назад"
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return formatDistanceToNow(d, {addSuffix: true, locale: ru});
};

// --- Date Manipulation ---

/**
 * Get the start of the week (Monday) for a given date
 */
export const getWeekStart = (date: Date): Date => {
  return startOfWeek(date, {weekStartsOn: 1});
};

/**
 * Add specified number of weeks to a date
 */
export const addWeeksToDate = (date: Date, weeks: number): Date => {
  return addWeeks(date, weeks);
};

/**
 * Add minutes to a date
 */
export const addMinutesToDate = (date: Date, minutes: number): Date => {
  return addMinutes(date, minutes);
};

// --- Date Comparisons ---

/**
 * Check if two dates are the same day
 */
export const isSameDayAs = (
  date1: Date | string,
  date2: Date | string,
): boolean => {
  const d1 = typeof date1 === 'string' ? parseApiDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseApiDate(date2) : date2;
  return isSameDay(d1, d2);
};

/**
 * Check if date is today
 */
export const isDateToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseApiDate(date) : date;
  return isToday(d);
};

/**
 * Check if first date is after second date
 */
export const isDateAfter = (
  date1: Date | string,
  date2: Date | string,
): boolean => {
  const d1 = typeof date1 === 'string' ? parseApiDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseApiDate(date2) : date2;
  return isAfter(d1, d2);
};

/**
 * Check if first date is before second date
 */
export const isDateBefore = (
  date1: Date | string,
  date2: Date | string,
): boolean => {
  const d1 = typeof date1 === 'string' ? parseApiDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseApiDate(date2) : date2;
  return isBefore(d1, d2);
};

/**
 * Compare two dates in ascending order (for sorting)
 * Returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDatesAsc = (
  date1: Date | string,
  date2: Date | string,
): number => {
  const d1 = typeof date1 === 'string' ? parseApiDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseApiDate(date2) : date2;
  return compareAsc(d1, d2);
};

/**
 * Compare two dates in descending order (for sorting)
 * Returns -1 if date1 > date2, 0 if equal, 1 if date1 < date2
 */
export const compareDatesDesc = (
  date1: Date | string,
  date2: Date | string,
): number => {
  const d1 = typeof date1 === 'string' ? parseApiDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseApiDate(date2) : date2;
  return compareDesc(d1, d2);
};

/**
 * Get end time from start time and duration
 */
export const getEndTime = (
  startTime: Date | string,
  durationMinutes: number,
): Date => {
  const start =
    typeof startTime === 'string' ? parseApiDate(startTime) : startTime;
  return addMinutes(start, durationMinutes);
};
