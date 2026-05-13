import {z} from 'zod';

export const trainerFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Некорректный URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type TrainerFormData = z.infer<typeof trainerFormSchema>;
