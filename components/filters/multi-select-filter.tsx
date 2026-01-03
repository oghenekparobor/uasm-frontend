'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps<T = string> {
  label: string;
  options: Array<{ value: T; label: string }>;
  selectedValues: T[];
  onChange: (values: T[]) => void;
  className?: string;
}

export function MultiSelectFilter<T = string>({
  label,
  options,
  selectedValues,
  onChange,
  className,
}: MultiSelectFilterProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value: T) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const hasSelection = selectedValues.length > 0;

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full justify-between',
          hasSelection && 'bg-gray-50 border-gray-400'
        )}
      >
        <span>
          {label}
          {hasSelection && (
            <span className="ml-2 px-2 py-0.5 rounded bg-black text-white text-xs">
              {selectedValues.length}
            </span>
          )}
        </span>
        <svg
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2">
              <div className="flex items-center justify-between mb-2 pb-2 border-b">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  {selectedValues.length === options.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
                {hasSelection && (
                  <button
                    onClick={handleClear}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <label
                      key={String(option.value)}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(option.value)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


