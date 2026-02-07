'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
  showLimitSelector?: boolean;
  limitOptions?: number[];
}

export function Pagination({
  meta,
  onPageChange,
  onLimitChange,
  className,
  showLimitSelector = true,
  limitOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const { page, limit, total, totalPages, hasNext, hasPrev } = meta;

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0', className)}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="text-sm text-gray-600 shrink-0">
          Showing <span className="font-medium">{startItem}</span>–<span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{total}</span>
        </div>

        {showLimitSelector && onLimitChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="limit" className="text-sm text-gray-600 shrink-0">
              Per page:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-black focus:outline-none shrink-0"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="shrink-0"
        >
          Previous
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              return (
                p === 1 ||
                p === totalPages ||
                (p >= page - 1 && p <= page + 1)
              );
            })
            .map((p, index, array) => {
              const showEllipsisBefore = index > 0 && array[index - 1] < p - 1;
              return (
                <div key={p} className="flex items-center gap-1">
                  {showEllipsisBefore && (
                    <span className="px-1 sm:px-2 text-gray-400 text-sm">...</span>
                  )}
                  <Button
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className={cn(
                      'min-w-[2.25rem] sm:min-w-[2.5rem]',
                      p === page && 'bg-black text-white'
                    )}
                  >
                    {p}
                  </Button>
                </div>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="shrink-0"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

