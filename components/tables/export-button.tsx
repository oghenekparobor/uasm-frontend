'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToJSON, exportSelectedToCSV } from '@/lib/export-utils';

interface ExportButtonProps<T> {
  data: T[];
  columns: Array<{ key: string; header: string; render?: (item: T) => string | React.ReactNode }>;
  filename?: string;
  selectedIds?: string[];
  keyExtractor?: (item: T) => string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function ExportButton<T>({
  data,
  columns,
  filename = 'export',
  selectedIds,
  keyExtractor,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps<T>) {
  const [showMenu, setShowMenu] = useState(false);

  const handleExportCSV = () => {
    if (selectedIds && keyExtractor) {
      exportSelectedToCSV(data, selectedIds, keyExtractor, columns, `${filename}.csv`);
    } else {
      exportToCSV(data, columns, `${filename}.csv`);
    }
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    const dataToExport = selectedIds && keyExtractor
      ? data.filter((item) => selectedIds.includes(keyExtractor(item)))
      : data;
    exportToJSON(dataToExport, `${filename}.json`);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowMenu(!showMenu)}
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
            <div className="p-2">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
              >
                Export as CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

