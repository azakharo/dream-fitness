import {z} from 'zod';

export const editProfileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().regex(/^\+?[0-9\s\-()]+$/, 'Неверный формат телефона'),
  birthDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Неверная дата',
  }),
  gender: z.enum(['male', 'female'], {
    error: () => ({message: 'Выберите пол'}),
  }),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
