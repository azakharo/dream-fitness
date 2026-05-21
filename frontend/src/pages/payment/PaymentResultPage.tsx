import {useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {CheckCircle, XCircle, Loader2} from 'lucide-react';
import {usePaymentStatus, useRefreshBalance} from '@/hooks/use-payments';
import {Button} from '@/components/ui';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui';
import {type PaymentStatus, PAYMENT_STATUS} from '@/types';

export const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const paymentId = searchParams.get('paymentId') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const isSuccess = status === 'success';

  const {data: paymentData, isLoading} = usePaymentStatus(paymentId ?? '');
  const refreshBalance = useRefreshBalance();

  useEffect(() => {
    if (
      paymentData?.status === PAYMENT_STATUS.CONFIRMED ||
      paymentData?.status === PAYMENT_STATUS.AUTHORIZED
    ) {
      refreshBalance();
    }
  }, [paymentData?.status, refreshBalance]);

  const handleReturn = () => {
    void navigate({to: '/profile'});
  };

  if (isLoading || !paymentId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPaymentSuccess =
    paymentData?.status === PAYMENT_STATUS.CONFIRMED ||
    paymentData?.status === PAYMENT_STATUS.AUTHORIZED ||
    isSuccess;

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isPaymentSuccess ? (
              <CheckCircle className="size-16 text-green-500" />
            ) : (
              <XCircle className="size-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {isPaymentSuccess ? 'Оплата прошла успешно!' : 'Ошибка оплаты'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {paymentData && (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Сумма: {paymentData.amount.toLocaleString('ru-RU')} баллов
              </p>
              <p className="text-sm text-muted-foreground">
                Статус: {getStatusLabel(paymentData.status)}
              </p>
            </div>
          )}

          <Button onClick={handleReturn} className="w-full">
            Вернуться в профиль
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case PAYMENT_STATUS.PENDING:
      return 'В обработке';
    case PAYMENT_STATUS.AUTHORIZED:
      return 'Авторизован';
    case PAYMENT_STATUS.CONFIRMED:
      return 'Подтверждён';
    case PAYMENT_STATUS.CANCELED:
      return 'Отменён';
    case PAYMENT_STATUS.REJECTED:
      return 'Отклонён';
    default:
      return status;
  }
}
