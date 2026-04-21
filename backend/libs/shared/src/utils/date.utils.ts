import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDateTime(dateOrString: Date | string): string {
  return format(new Date(dateOrString), 'd MMMM yyyy, HH:mm', {
    locale: ru,
  });
}
