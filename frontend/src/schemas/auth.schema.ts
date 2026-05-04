import {z} from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Минимум 2 символа'),
    email: z.string().email('Некорректный email'),
    phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +79991234567'),
    birthDate: z.date({message: 'Выберите дату рождения'}).refine(date => {
      const now = new Date();
      return date < now && date > new Date('1900-01-01');
    }, 'Некорректная дата рождения'),
    gender: z.enum(['male', 'female'], {
      error: () => ({message: 'Выберите пол'}),
    }),
    password: z.string().min(8, 'Минимум 8 символов'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
