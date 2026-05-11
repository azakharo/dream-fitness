import React from 'react';
import {Search} from 'lucide-react';

import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import type {UserFilters as UserFiltersType} from '@/hooks/use-users';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value || undefined,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as 'active' | 'blocked'),
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      role: value === 'all' ? undefined : (value as 'client' | 'admin'),
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.status || filters.role;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-[300px] min-w-[200px] flex-1">
        <Search
          className="
            absolute top-1/2 left-3 size-4 -translate-y-1/2
            text-muted-foreground
          "
        />
        <Input
          type="search"
          placeholder="Поиск по имени или email..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

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
        <option value="active">Активен</option>
        <option value="blocked">Заблокирован</option>
      </select>

      <select
        value={filters.role || 'all'}
        onChange={handleRoleChange}
        className="
          h-10 rounded-md border border-input bg-background px-3 py-2 text-sm
          ring-offset-background
          focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none
        "
      >
        <option value="all">Все роли</option>
        <option value="client">Клиент</option>
        <option value="admin">Администратор</option>
      </select>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleReset}>
          Сбросить
        </Button>
      )}
    </div>
  );
};
