import {z} from 'zod';

export const editProfileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Неверный формат телефона')
    .optional()
    .or(z.literal('')),
  birthDate: z.date().optional(),
  gender: z.enum(['male', 'female'], {
    error: () => ({message: 'Выберите пол'}),
  }),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
