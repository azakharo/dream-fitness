import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {Input} from '@/components/ui/Input';
import {Button} from '@/components/ui/Button';
import {trainerFormSchema} from '@/schemas/trainer.schema';
import type {TrainerFormData} from '@/schemas/trainer.schema';
import type {TrainerResponseDto} from '@/types';
import {cn} from '@/lib/utils';

interface TrainerFormProps {
  trainer?: TrainerResponseDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const getStringValue = (value: unknown): string => {
  if (!value || typeof value !== 'string') return '';
  return value;
};

export const TrainerForm: React.FC<TrainerFormProps> = ({
  trainer,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!trainer;

  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerFormSchema) as never,
    defaultValues: {
      name: trainer?.name ?? '',
      bio: getStringValue(trainer?.bio),
      avatarUrl: getStringValue(trainer?.avatarUrl),
      isActive: trainer?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (trainer) {
      void form.reset({
        name: trainer.name,
        bio: getStringValue(trainer.bio),
        avatarUrl: getStringValue(trainer.avatarUrl),
        isActive: trainer.isActive,
      });
    }
  }, [trainer, form]);

  const handleSubmit = (data: TrainerFormData) => {
    console.log('Trainer form submitted:', data);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form form={form as never}>
      <form
        onSubmit={form.handleSubmit(handleSubmit) as never}
        className="space-y-4"
      >
        <FormField
          control={form.control as never}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input placeholder="Введите имя тренера" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as never}
          name="bio"
          render={({field}) => (
            <FormItem>
              <FormLabel>Биография</FormLabel>
              <FormControl>
                <textarea
                  className={cn(
                    `
                      flex min-h-[80px] w-full rounded-md border border-input
                      bg-background px-3 py-2 text-sm ring-offset-background
                    `,
                    'placeholder:text-muted-foreground',
                    `
                      focus-visible:ring-2 focus-visible:ring-ring
                      focus-visible:ring-offset-2 focus-visible:outline-none
                    `,
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                  placeholder="Расскажите о тренере..."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as never}
          name="avatarUrl"
          render={({field}) => (
            <FormItem>
              <FormLabel>URL аватара</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditMode && (
          <FormField
            control={form.control as never}
            name="isActive"
            render={({field}) => (
              <FormItem
                className="
                  flex flex-row items-center justify-between rounded-lg border
                  p-4
                "
              >
                <div className="space-y-0.5">
                  <FormLabel>Статус</FormLabel>
                </div>
                <FormControl>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    data-state={field.value ? 'checked' : 'unchecked'}
                    className={cn(
                      `
                        peer inline-flex h-6 w-11 shrink-0 cursor-pointer
                        items-center rounded-full border-2 border-transparent
                        transition-colors
                      `,
                      `
                        focus-visible:ring-2 focus-visible:ring-ring
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-background
                        focus-visible:outline-none
                      `,
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      field.value ? 'bg-primary' : 'bg-input',
                    )}
                    onClick={() => field.onChange(!field.value)}
                  >
                    <span
                      data-state={field.value ? 'checked' : 'unchecked'}
                      className={cn(
                        `
                          pointer-events-none block size-5 rounded-full
                          bg-background shadow-lg ring-0 transition-transform
                        `,
                        field.value ? 'translate-x-5' : 'translate-x-0',
                      )}
                    />
                  </button>
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          )}
          <Button type="submit">{isEditMode ? 'Сохранить' : 'Создать'}</Button>
        </div>
      </form>
    </Form>
  );
};
