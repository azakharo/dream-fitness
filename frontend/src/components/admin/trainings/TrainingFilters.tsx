import React from 'react';

import {Button} from '@/components/ui/Button';
import {DatePicker} from '@/components/ui/DatePicker';
import {
  TRAINING_TYPE_OPTIONS,
  TRAINING_STATUS_OPTIONS,
} from '@/types/constants';
import type {TrainerResponseDto} from '@/types';
import type {TrainingFilters as TrainingFiltersType} from '@/hooks/use-trainings';

interface TrainingFiltersProps {
  filters: TrainingFiltersType;
  onFiltersChange: (filters: TrainingFiltersType) => void;
  trainers: TrainerResponseDto[];
}

export const TrainingFilters: React.FC<TrainingFiltersProps> = ({
  filters,
  onFiltersChange,
  trainers,
}) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : value,
    });
  };

  const handleTrainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      trainerId: value === 'all' ? undefined : value,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateFrom: date,
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateTo: date,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.type ||
    filters.trainerId ||
    filters.status ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.type || 'all'}
        onChange={handleTypeChange}
        className="
          h-10 rounded-md border border-input bg-background px-3 py-2 text-sm
          ring-offset-background
          focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none
        "
      >
        <option value="all">Все типы</option>
        {TRAINING_TYPE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.trainerId || 'all'}
        onChange={handleTrainerChange}
        className="
          h-10 rounded-md border border-input bg-background px-3 py-2 text-sm
          ring-offset-background
          focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none
        "
      >
        <option value="all">Все тренеры</option>
        {trainers.map(trainer => (
          <option key={trainer.id} value={trainer.id}>
            {trainer.name}
          </option>
        ))}
      </select>

      <select
        value={filters.status || 'all'}
        onChange={handleStatusChange}
        className="
          h-10 rounded-md border border-input bg-background px-3 py-2 text-sm
          ring-offset-background
          focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none
        "
      >
        <option value="all">Все статусы</option>
        {TRAINING_STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <DatePicker
          value={filters.dateFrom}
          onChange={handleDateFromChange}
          placeholder="От"
        />
        <span className="text-muted-foreground">—</span>
        <DatePicker
          value={filters.dateTo}
          onChange={handleDateToChange}
          placeholder="До"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleReset}>
          Сбросить
        </Button>
      )}
    </div>
  );
};
