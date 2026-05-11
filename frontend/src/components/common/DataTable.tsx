import * as React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {cn} from '@/lib/utils';
import {Skeleton} from '@/components/ui/Skeleton';
import {Button} from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Checkbox} from '@/components/ui/Checkbox';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortingState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination: PaginationState;
  onPaginationChange: (pagination: {page: number; pageSize: number}) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  selectedRows: Set<string>;
  onSelectedRowsChange: (selectedRows: Set<string>) => void;
  rowIdKey: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  selectedRows,
  onSelectedRowsChange,
  rowIdKey,
  onRowClick,
  isLoading = false,
  emptyMessage = 'Нет данных',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const handleSort = (columnKey: string) => {
    if (sorting.sortBy === columnKey) {
      onSortingChange({
        sortBy: columnKey,
        sortOrder: sorting.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortingChange({sortBy: columnKey, sortOrder: 'asc'});
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      onSelectedRowsChange(new Set());
    } else {
      onSelectedRowsChange(new Set(data.map(item => String(item[rowIdKey]))));
    }
  };

  const handleSelectRow = (item: T) => {
    const newSelected = new Set(selectedRows);
    const itemId = String(item[rowIdKey]);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    onSelectedRowsChange(newSelected);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPaginationChange({...pagination, page: newPage});
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sorting.sortBy !== columnKey) {
      return <ArrowUpDown className="ml-2 size-4 text-muted-foreground" />;
    }
    return sorting.sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 size-4 text-foreground" />
    ) : (
      <ArrowDown className="ml-2 size-4 text-foreground" />
    );
  };

  const getRowId = (item: T): string => String(item[rowIdKey]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Skeleton className="size-4" />
                </TableHead>
                {columns.map((column, index) => (
                  <TableHead key={index} style={{width: column.width}}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({length: pagination.pageSize}).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>
                    <Skeleton className="size-4" />
                  </TableCell>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={data.length > 0 && selectedRows.size === data.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Выбрать все"
                />
              </TableHead>
              {columns.map(column => (
                <TableHead
                  key={String(column.key)}
                  style={{width: column.width}}
                  className={cn(
                    column.sortable && 'cursor-pointer select-none',
                  )}
                  onClick={
                    column.sortable
                      ? () => handleSort(String(column.key))
                      : undefined
                  }
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && renderSortIcon(String(column.key))}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-32 text-center"
                >
                  <span className="text-muted-foreground">{emptyMessage}</span>
                </TableCell>
              </TableRow>
            ) : (
              data.map(item => {
                const itemId = getRowId(item);
                const isSelected = selectedRows.has(itemId);
                return (
                  <TableRow
                    key={itemId}
                    data-state={isSelected ? 'selected' : undefined}
                    className={cn(onRowClick && 'cursor-pointer')}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(item)}
                        aria-label={`Выбрать строку ${itemId}`}
                      />
                    </TableCell>
                    {columns.map(column => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Выбрано: {selectedRows.size} из {pagination.total}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Страница {pagination.page} из {totalPages || 1}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {generatePageNumbers(pagination.page, totalPages).map(
              (pageNum, index) =>
                pageNum === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={
                      pagination.page === pageNum ? 'default' : 'outline'
                    }
                    size="icon"
                    onClick={() => handlePageChange(Number(pageNum))}
                    aria-label={`Страница ${pageNum}`}
                    aria-current={
                      pagination.page === pageNum ? 'page' : undefined
                    }
                  >
                    {pageNum}
                  </Button>
                ),
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              aria-label="Следующая страница"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}
