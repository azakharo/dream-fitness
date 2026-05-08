import type {NotificationType} from '@/types';
import {Button} from '@/components/ui/Button';

interface NotificationFiltersProps {
  selectedType?: NotificationType;
  onTypeChange: (type?: NotificationType) => void;
}

type FilterOption = {
  value?: NotificationType;
  label: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  {value: undefined, label: 'Все'},
  {value: 'booking_confirmation', label: 'Бронирование'},
  {value: 'booking_cancellation', label: 'Отмена'},
  {value: 'balance_change', label: 'Транзакции'},
  {value: 'training_reminder', label: 'Напоминания'},
  {value: 'waitlist_joined', label: 'Лист ожидания'},
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-4">
      {FILTER_OPTIONS.map(option => (
        <Button
          key={option.label}
          variant={selectedType === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange(option.value)}
          className="text-sm"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};
