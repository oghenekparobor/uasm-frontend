'use client';

import { useState, useMemo } from 'react';
import { SortableHeader, type SortDirection } from './sortable-header';
import { Pagination, type PaginationMeta } from './pagination';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => React.ReactNode;
  bulkActions?: React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pagination,
  onPageChange,
  onLimitChange,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  rowActions,
  bulkActions,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'No data available',
  loading = false,
  className,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRowActions, setShowRowActions] = useState<string | null>(null);

  const allSelected = useMemo(() => {
    if (!selectable || data.length === 0) return false;
    return data.every((item) => selectedIds.has(keyExtractor(item)));
  }, [data, selectedIds, keyExtractor, selectable]);

  const someSelected = useMemo(() => {
    if (!selectable) return false;
    return selectedIds.size > 0 && selectedIds.size < data.length;
  }, [selectedIds, data.length, selectable]);

  const handleSelectAll = () => {
    if (!selectable) return;

    const newSelected = new Set<string>();
    if (!allSelected) {
      data.forEach((item) => {
        newSelected.add(keyExtractor(item));
      });
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectRow = (id: string) => {
    if (!selectable) return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 min-w-0', className)}>
      {/* Bulk Actions */}
      {selectable && selectedIds.size > 0 && bulkActions && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex flex-wrap items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Table - horizontal scroll on mobile, sticky header */}
      <div className="w-full min-w-0 -mx-2 sm:mx-0">
        <div className="overflow-x-auto overflow-y-visible border border-gray-200 rounded-lg overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="inline-block min-w-full align-middle">
            <table className="w-full min-w-[640px] border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-[1]">
            <tr>
              {selectable && (
                <th className="w-12 px-3 sm:px-4 py-3 text-left bg-gray-50">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-black w-4 h-4 min-w-[20px] min-h-[20px] touch-manipulation"
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((column) => (
                <SortableHeader
                  key={column.key}
                  sortKey={column.sortable ? column.key : undefined}
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={onSort}
                  className={cn('px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 whitespace-nowrap', column.headerClassName)}
                >
                  {column.header}
                </SortableHeader>
              ))}
              {rowActions && (
                <th className="w-14 sm:w-12 px-2 sm:px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.has(id);
              const isActionsOpen = showRowActions === id;

              return (
                <tr
                  key={id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-blue-50',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => {
                    if (onRowClick && !isActionsOpen) {
                      onRowClick(item);
                    }
                  }}
                >
                  {selectable && (
                    <td
                      className="px-3 sm:px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        className="rounded border-gray-300 text-black focus:ring-black w-4 h-4 min-w-[20px] min-h-[20px] touch-manipulation"
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn('px-3 sm:px-4 py-3 text-sm text-gray-900', column.className)}
                    >
                      {column.render
                        ? column.render(item)
                        : (item as any)[column.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td
                      className="px-2 sm:px-4 py-3 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowRowActions(isActionsOpen ? null : id)
                          }
                          className="min-w-[44px] min-h-[44px] w-10 h-10 sm:w-8 sm:h-8 p-0 flex items-center justify-center touch-manipulation"
                          aria-label="Row actions"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </Button>
                        {isActionsOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowRowActions(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                              <div className="p-2">
                                {rowActions(item)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination
          meta={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}

