import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link} from '@tanstack/react-router';
import {useRegister} from '@/hooks/use-auth';
import {registerSchema} from '@/schemas/auth.schema';
import type {RegisterFormData} from '@/schemas/auth.schema';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {DatePicker} from '@/components/ui/date-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {ROUTES} from '@/lib/routes';

const GENDER_OPTIONS = [
  {value: 'male', label: 'Мужской'},
  {value: 'female', label: 'Женский'},
] as const;

export const RegisterForm: React.FC = () => {
  const registerMutation = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      gender: 'male',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт DreamFitness</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={event => {
            event.preventDefault();
            void form.handleSubmit(onSubmit)();
          }}
          className="space-y-4"
        >
          <FormField
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder="Иван Иванов" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="phone"
            render={({field}) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input placeholder="+79991234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="birthDate"
            render={({field}) => (
              <FormItem>
                <FormLabel>Дата рождения</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value as string | undefined}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="gender"
            render={({field}) => (
              <FormItem>
                <FormLabel>Пол</FormLabel>
                <FormControl>
                  <select
                    className="
                      flex h-10 w-full rounded-md border border-input
                      bg-background px-3 py-2 text-sm ring-offset-background
                      focus-visible:ring-2 focus-visible:ring-ring
                      focus-visible:ring-offset-2 focus-visible:outline-none
                    "
                    {...field}
                  >
                    {GENDER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            render={({field}) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="confirmPassword"
            render={({field}) => (
              <FormItem>
                <FormLabel>Подтвердите пароль</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {registerMutation.isError && (
            <p className="text-sm text-red-500">
              Ошибка регистрации. Попробуйте снова.
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? 'Регистрация...'
              : 'Зарегистрироваться'}
          </Button>

          <p className="text-center text-sm">
            Уже есть аккаунт?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary underline">
              Войти
            </Link>
          </p>
        </Form>
      </CardContent>
    </Card>
  );
};
