import React from 'react';
import {Button} from '@/components/ui/Button';
import {TRAINING_TYPE_OPTIONS} from '@/types/constants';
import type {TrainerResponseDto} from '@/types';

interface ScheduleFiltersProps {
  filters: {
    type?: string;
    trainerId?: string;
  };
  onFiltersChange: (filters: {type?: string; trainerId?: string}) => void;
  trainers: TrainerResponseDto[];
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
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

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.type || filters.trainerId;

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

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleReset}>
          Сбросить
        </Button>
      )}
    </div>
  );
};
