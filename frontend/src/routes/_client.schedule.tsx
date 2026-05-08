import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';

import {SchedulePage} from '@/pages/client/SchedulePage';

/**
 * Search params schema for schedule page URL state.
 * All parameters are optional and will only appear in URL when set.
 */
const scheduleSearchSchema = z.object({
  /**
   * Start of the week in yyyy-MM-dd format (e.g., "2024-01-15").
   * Defaults to current week's Monday if not specified.
   */
  week: z.string().optional(),
  trainingTypeId: z.string().optional(),
  trainerId: z.string().optional(),
});

export type ScheduleSearchSchema = z.infer<typeof scheduleSearchSchema>;

export const Route = createFileRoute('/_client/schedule')({
  validateSearch: scheduleSearchSchema,
  component: SchedulePage,
});
