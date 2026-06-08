import {addDays, format, isToday, isSameDay, startOfWeek} from 'date-fns';
import {ru} from 'date-fns/locale';
import {cn} from '@/lib/utils';

interface WeekNavProps {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const WeekNav: React.FC<WeekNavProps> = ({
  currentWeekStart,
  onWeekChange,
  selectedDate,
  onDateSelect,
}) => {
  const weekDays = Array.from({length: 7}, (_, i) =>
    addDays(currentWeekStart, i),
  );

  const goToPreviousWeek = () => {
    onWeekChange(addDays(currentWeekStart, -7));
  };

  const goToNextWeek = () => {
    onWeekChange(addDays(currentWeekStart, 7));
  };

  const goToToday = () => {
    onWeekChange(startOfWeek(new Date(), {weekStartsOn: 1}));
    onDateSelect(new Date());
  };

  return (
    <div
      className="
        rounded-xl border border-[oklch(0.90_0.01_130)] bg-card p-4
        dark:border-[oklch(0.30_0.02_130)]
      "
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          className="
            rounded-lg p-2 text-muted-foreground
            hover:bg-[oklch(0.94_0.10_130)] hover:text-[oklch(0.35_0.12_130)]
          "
        >
          ←
        </button>
        <button
          onClick={goToToday}
          className="
            rounded-lg px-3 py-1 text-sm font-medium text-muted-foreground
            hover:bg-[oklch(0.94_0.10_130)] hover:text-[oklch(0.35_0.12_130)]
          "
        >
          Сегодня
        </button>
        <button
          onClick={goToNextWeek}
          className="
            rounded-lg p-2 text-muted-foreground
            hover:bg-[oklch(0.94_0.10_130)] hover:text-[oklch(0.35_0.12_130)]
          "
        >
          →
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {weekDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                `
                  flex min-w-[70px] flex-col items-center gap-1 rounded-xl px-4
                  py-3 text-sm font-medium transition-all
                `,
                isSelected
                  ? `
                    bg-linear-to-r from-[oklch(0.75_0.22_125)]
                    to-[oklch(0.65_0.20_135)] text-white
                  `
                  : 'hover:bg-[oklch(0.94_0.10_130)]',
                isTodayDate && !isSelected && 'text-[oklch(0.68_0.22_130)]',
              )}
            >
              <span className="text-xs uppercase">
                {format(day, 'EEE', {locale: ru})}
              </span>
              <span className="text-base">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
