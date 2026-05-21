import {useState} from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {toast} from 'sonner';
import {useInitPayment} from '@/hooks/use-payments';
import {Button} from '@/components/ui';
import {Input} from '@/components/ui';
import {Label} from '@/components/ui';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';
import {useNavigate} from '@tanstack/react-router';

interface TopUpBalanceProps {
  currentBalance: number;
  onSuccess?: () => void;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const topUpSchema = z.object({
  amount: z
    .number()
    .min(1, 'Минимальная сумма 1 балл')
    .max(100000, 'Максимальная сумма 100000 баллов'),
});

type TopUpFormData = z.infer<typeof topUpSchema>;

export const TopUpBalance: React.FC<TopUpBalanceProps> = ({currentBalance}) => {
  const navigate = useNavigate();
  const initPaymentMutation = useInitPayment();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);

  const form = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      amount: 1000,
    },
  });

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue('amount', amount);
  };

  const onSubmit = (data: TopUpFormData) => {
    initPaymentMutation.mutate(
      {amount: data.amount},
      {
        onSuccess: response => {
          void navigate({to: response.paymentUrl, search: true});
        },
        onError: () => {
          toast.error('Не удалось инициализировать платёж');
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пополнение баланса</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-medium">
          Текущий баланс: {currentBalance.toLocaleString('ru-RU')} баллов
        </p>

        <form
          onSubmit={event => {
            event.preventDefault();
            void form.handleSubmit(onSubmit)(event);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              max={100000}
              {...form.register('amount', {valueAsNumber: true})}
              placeholder="Введите сумму"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Быстрый выбор:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map(amount => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? 'default' : 'outline'}
                  onClick={() => handleQuickAmount(amount)}
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={initPaymentMutation.isPending}
          >
            {initPaymentMutation.isPending ? 'Перенаправление...' : 'Пополнить'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
