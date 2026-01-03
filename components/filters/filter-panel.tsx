'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangePicker } from './date-range-picker';
import { MultiSelectFilter } from './multi-select-filter';
import { cn } from '@/lib/utils';

export interface FilterOption {
  type: 'date-range' | 'multi-select' | 'text' | 'select';
  key: string;
  label: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
  showClearButton?: boolean;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onClear,
  className,
  showClearButton = true,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = Object.values(values).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some((v) => v);
    }
    return value !== undefined && value !== null && value !== '';
  });

  const activeFilterCount = Object.values(values).filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some((v) => v);
    }
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(hasActiveFilters && 'bg-gray-50 border-gray-400')}
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded bg-black text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {showClearButton && hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => {
                if (filter.type === 'date-range') {
                  return (
                    <div key={filter.key} className="col-span-full">
                      <DateRangePicker
                        startDate={values[filter.key]?.start}
                        endDate={values[filter.key]?.end}
                        onChange={(start, end) =>
                          onChange(filter.key, { start, end })
                        }
                      />
                    </div>
                  );
                }

                if (filter.type === 'multi-select') {
                  return (
                    <MultiSelectFilter
                      key={filter.key}
                      label={filter.label}
                      options={filter.options || []}
                      selectedValues={values[filter.key] || []}
                      onChange={(selected) => onChange(filter.key, selected)}
                    />
                  );
                }

                if (filter.type === 'select') {
                  return (
                    <div key={filter.key}>
                      <label className="block text-sm font-medium mb-2">
                        {filter.label}
                      </label>
                      <select
                        value={values[filter.key] || ''}
                        onChange={(e) =>
                          onChange(filter.key, e.target.value || undefined)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      >
                        <option value="">All</option>
                        {filter.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (filter.type === 'text') {
                  return (
                    <div key={filter.key}>
                      <label className="block text-sm font-medium mb-2">
                        {filter.label}
                      </label>
                      <input
                        type="text"
                        value={values[filter.key] || ''}
                        onChange={(e) =>
                          onChange(filter.key, e.target.value || undefined)
                        }
                        placeholder={filter.placeholder}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


