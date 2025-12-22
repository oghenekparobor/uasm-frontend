'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey?: string;
  currentSort?: string;
  currentDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  className?: string;
}

export function SortableHeader({
  children,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = sortKey && currentSort === sortKey;
  const direction = isActive ? currentDirection : null;

  const handleClick = () => {
    if (!sortKey || !onSort) return;

    let newDirection: SortDirection = 'asc';
    if (isActive && currentDirection === 'asc') {
      newDirection = 'desc';
    } else if (isActive && currentDirection === 'desc') {
      newDirection = null;
    }

    onSort(sortKey, newDirection);
  };

  if (!sortKey || !onSort) {
    return <th className={className}>{children}</th>;
  }

  return (
    <th
      className={cn(
        'cursor-pointer select-none hover:bg-gray-50 transition-colors',
        isActive && 'bg-gray-50',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <div className="flex flex-col">
          <svg
            className={cn(
              'w-3 h-3',
              direction === 'asc' ? 'text-black' : 'text-gray-300'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 12l5-5 5 5H5z" />
          </svg>
          <svg
            className={cn(
              'w-3 h-3 -mt-1',
              direction === 'desc' ? 'text-black' : 'text-gray-300'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 8l5 5 5-5H5z" />
          </svg>
        </div>
      </div>
    </th>
  );
}

