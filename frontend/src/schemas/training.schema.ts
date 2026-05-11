import {z} from 'zod';

export const trainingFormSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  type: z.string().min(1, 'Выберите тип тренировки'),
  trainerId: z.string().min(1, 'Выберите тренера'),
  scheduledAt: z.date(),
  durationMinutes: z.number().min(15).max(480).default(60),
  capacity: z.number().min(1).max(100),
  price: z.number().min(0),
  description: z.string().optional(),
  status: z.string().optional(),
});

export type TrainingFormData = z.infer<typeof trainingFormSchema>;
