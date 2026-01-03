'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (startDate?: string, endDate?: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (value: string) => {
    onChange(value || undefined, endDate);
  };

  const handleEndDateChange = (value: string) => {
    onChange(startDate, value || undefined);
  };

  const handleClear = () => {
    onChange(undefined, undefined);
  };

  const hasValue = startDate || endDate;

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          label="From"
          value={startDate || ''}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="w-full"
        />
        <span className="text-gray-500">to</span>
        <Input
          type="date"
          label="To"
          value={endDate || ''}
          onChange={(e) => handleEndDateChange(e.target.value)}
          className="w-full"
        />
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 w-8 p-0"
            title="Clear date range"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}


