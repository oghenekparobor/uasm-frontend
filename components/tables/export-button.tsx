'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToJSON, exportSelectedToCSV } from '@/lib/export-utils';
import { exportApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface ExportButtonProps<T> {
  data: T[];
  columns: Array<{ key: string; header: string; render?: (item: T) => string | React.ReactNode }>;
  filename?: string;
  selectedIds?: string[];
  keyExtractor?: (item: T) => string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  // Server-side export options
  serverExport?: {
    type: 'members' | 'attendance' | 'distribution' | 'activity-logs' | 'empowerment-requests';
    params?: Record<string, any>;
  };
}

export function ExportButton<T>({
  data,
  columns,
  filename = 'export',
  selectedIds,
  keyExtractor,
  variant = 'outline',
  size = 'sm',
  serverExport,
}: ExportButtonProps<T>) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleServerExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    if (!serverExport) return;

    try {
      setExporting(true);
      let response;
      const params = { ...serverExport.params };

      switch (serverExport.type) {
        case 'members':
          response = await exportApi.exportMembers(format, params);
          break;
        case 'attendance':
          response = await exportApi.exportAttendance(format, params);
          break;
        case 'distribution':
          response = await exportApi.exportDistribution(format, params);
          break;
        case 'activity-logs':
          response = await exportApi.exportActivityLogs(format, params);
          break;
        case 'empowerment-requests':
          response = await exportApi.exportEmpowermentRequests(format, params);
          break;
        default:
          throw new Error('Invalid export type');
      }

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${serverExport.type}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export');
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  const handleExportCSV = () => {
    if (serverExport) {
      handleServerExport('csv');
      return;
    }

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

  const handleExportExcel = () => {
    if (serverExport) {
      handleServerExport('xlsx');
    } else {
      toast.error('Excel export requires server-side export');
    }
  };

  const handleExportPDF = () => {
    if (serverExport) {
      handleServerExport('pdf');
    } else {
      toast.error('PDF export requires server-side export');
    }
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
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
        {exporting ? 'Exporting...' : 'Export'}
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
                disabled={exporting}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Export as CSV
              </button>
              {serverExport && (
                <>
                  <button
                    onClick={handleExportExcel}
                    disabled={exporting}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Export as PDF
                  </button>
                </>
              )}
              {!serverExport && (
                <button
                  onClick={handleExportJSON}
                  disabled={exporting}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Export as JSON
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

