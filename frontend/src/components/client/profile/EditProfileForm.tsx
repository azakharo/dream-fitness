import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {toast} from 'sonner';
import {format} from 'date-fns';
import type {UserProfileDto} from '@/types';
import {useUpdateProfile} from '@/hooks/use-auth';
import {editProfileSchema} from '@/schemas/user.schema';
import type {EditProfileFormData} from '@/schemas/user.schema';
import {Button} from '@/components/ui';
import {Input} from '@/components/ui';
import {DatePicker} from '@/components/ui/DatePicker';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';

interface EditProfileFormProps {
  user: UserProfileDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GENDER_OPTIONS = [
  {value: 'male', label: 'Мужской'},
  {value: 'female', label: 'Женский'},
];

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  user,
  onSuccess,
  onCancel,
}) => {
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name || '',
      phone: user.phone || '',
      birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
      gender: user.gender || 'male',
    },
  });

  const onSubmit = (data: EditProfileFormData) => {
    const payload = {
      ...data,
      birthDate: data.birthDate
        ? format(data.birthDate, 'yyyy-MM-dd')
        : undefined,
    };
    updateProfileMutation.mutate(payload as EditProfileFormData, {
      onSuccess: () => {
        toast.success('Профиль обновлен!');
        onSuccess?.();
      },
      onError: () => {
        toast.error('Не удалось обновить профиль');
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование профиля</CardTitle>
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
            name="phone"
            render={({field}) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input placeholder="+7 999 123 45 67" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="birthDate"
            render={({field}) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата рождения</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value as Date | undefined}
                    onChange={date => field.onChange(date)}
                    placeholder="Выберите дату"
                    disabled={false}
                    captionLayout="dropdown"
                    // Обязательно указываем границы, чтобы сформировать список годов
                    startMonth={new Date(1926, 0)}
                    endMonth={new Date()}
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
                    {...field}
                    className="
                      flex h-10 w-full items-center justify-between rounded-md
                      border border-input bg-background px-3 py-2 text-sm
                      ring-offset-background
                      placeholder:text-muted-foreground
                      focus:ring-2 focus:ring-ring focus:ring-offset-2
                      focus:outline-none
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    <option value="">Выберите пол</option>
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
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={updateProfileMutation.isPending}
            >
              Отмена
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
