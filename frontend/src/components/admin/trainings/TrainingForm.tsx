import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {format, parseISO} from 'date-fns';

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
import {
  trainingFormSchema,
  type TrainingFormData,
} from '@/schemas/training.schema';
import type {TrainingResponseDto, TrainerResponseDto} from '@/types';
import {
  TRAINING_TYPE_OPTIONS,
  TRAINING_STATUS_OPTIONS,
} from '@/types/constants';
import {cn} from '@/lib/utils';

interface TrainingFormProps {
  training?: TrainingResponseDto;
  trainers: TrainerResponseDto[];
  onSuccess?: (data: TrainingFormData) => void;
  onCancel?: () => void;
}

const getStringValue = (value: unknown): string => {
  if (!value || typeof value !== 'string') return '';
  return value;
};

const formatDateForInput = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

const parseDateFromString = (dateString: string): Date => {
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

export const TrainingForm: React.FC<TrainingFormProps> = ({
  training,
  trainers,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!training;

  const form = useForm<TrainingFormData>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      title: training?.title ?? '',
      type: training?.type ?? '',
      trainerId: training?.trainerId ?? '',
      scheduledAt: training ? parseISO(training.scheduledAt) : new Date(),
      durationMinutes: training?.durationMinutes ?? 60,
      capacity: training?.capacity ?? 20,
      price: training?.price ?? 0,
      description: getStringValue(training?.description),
      status: training?.status,
    },
  });

  useEffect(() => {
    if (training) {
      void form.reset({
        title: training.title,
        type: training.type,
        trainerId: training.trainerId,
        scheduledAt: parseISO(training.scheduledAt),
        durationMinutes: training.durationMinutes,
        capacity: training.capacity,
        price: training.price,
        description: getStringValue(training.description),
        status: training.status,
      });
    }
  }, [training, form]);

  const handleSubmit = (data: TrainingFormData) => {
    if (onSuccess) {
      onSuccess(data);
    }
  };

  return (
    <Form
      form={form}
      onSubmit={event => {
        event.preventDefault();
        void form.handleSubmit(handleSubmit)();
      }}
      className="space-y-4"
    >
      <FormField
        control={form.control}
        name="title"
        render={({field}) => (
          <FormItem>
            <FormLabel>Название</FormLabel>
            <FormControl>
              <Input placeholder="Введите название тренировки" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({field}) => (
          <FormItem>
            <FormLabel>Тип тренировки</FormLabel>
            <FormControl>
              <select
                {...field}
                className={cn(
                  `
                    flex h-10 w-full rounded-md border border-input
                    bg-background px-3 py-2 text-sm ring-offset-background
                    focus-visible:ring-2 focus-visible:ring-ring
                    focus-visible:ring-offset-2 focus-visible:outline-none
                  `,
                  !field.value && 'text-muted-foreground',
                )}
              >
                <option value="">Выберите тип</option>
                {TRAINING_TYPE_OPTIONS.map(option => (
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
        control={form.control}
        name="trainerId"
        render={({field}) => (
          <FormItem>
            <FormLabel>Тренер</FormLabel>
            <FormControl>
              <select
                {...field}
                className={cn(
                  `
                    flex h-10 w-full rounded-md border border-input
                    bg-background px-3 py-2 text-sm ring-offset-background
                    focus-visible:ring-2 focus-visible:ring-ring
                    focus-visible:ring-offset-2 focus-visible:outline-none
                  `,
                  !field.value && 'text-muted-foreground',
                )}
              >
                <option value="">Выберите тренера</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scheduledAt"
        render={({field}) => (
          <FormItem>
            <FormLabel>Дата и время</FormLabel>
            <FormControl>
              <Input
                type="datetime-local"
                value={field.value ? formatDateForInput(field.value) : ''}
                onChange={e => {
                  const date = parseDateFromString(e.target.value);
                  field.onChange(date);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="durationMinutes"
        render={({field}) => (
          <FormItem>
            <FormLabel>Длительность (минуты)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={15}
                max={480}
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="capacity"
        render={({field}) => (
          <FormItem>
            <FormLabel>Количество мест</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={100}
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({field}) => (
          <FormItem>
            <FormLabel>Цена (баллы)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({field}) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
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
                placeholder="Описание тренировки..."
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
          control={form.control}
          name="status"
          render={({field}) => (
            <FormItem>
              <FormLabel>Статус</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value ?? ''}
                  className={cn(
                    `
                      flex h-10 w-full rounded-md border border-input
                      bg-background px-3 py-2 text-sm ring-offset-background
                      focus-visible:ring-2 focus-visible:ring-ring
                      focus-visible:ring-offset-2 focus-visible:outline-none
                    `,
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {TRAINING_STATUS_OPTIONS.map(option => (
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
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit">{isEditMode ? 'Сохранить' : 'Создать'}</Button>
      </div>
    </Form>
  );
};
