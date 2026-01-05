'use client';

import { useMemo } from 'react';

interface AttendanceRecord {
  id: string;
  status: 'present' | 'absent';
  markedAt: string;
  attendanceWindow?: {
    id: string;
    sundayDate: string;
  };
}

interface AttendanceHeatmapProps {
  records: AttendanceRecord[];
  className?: string;
}

export function AttendanceHeatmap({ records, className }: AttendanceHeatmapProps) {
  // Create a map of window ID -> status for quick lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<string, 'present' | 'absent'>();
    records.forEach((record) => {
      if (record.attendanceWindow?.id) {
        map.set(record.attendanceWindow.id, record.status);
      }
    });
    return map;
  }, [records]);

  // Group records by attendance window and sort by date
  const windowData = useMemo(() => {
    const windowsMap = new Map<string, { windowId: string; sundayDate: Date; status: 'present' | 'absent' }>();
    
    records.forEach((record: any) => {
      // Handle both possible structures: attendanceWindow or attendanceWindowId
      const windowId = record.attendanceWindow?.id || record.attendanceWindowId;
      const sundayDate = record.attendanceWindow?.sundayDate || record.sundayDate;
      const status = record.status;
      
      if (windowId && sundayDate && status) {
        const date = new Date(sundayDate);
        
        // Only keep the most recent record per window (in case of duplicates)
        const existing = windowsMap.get(windowId);
        if (!existing || date > existing.sundayDate) {
          windowsMap.set(windowId, {
            windowId,
            sundayDate: date,
            status: status as 'present' | 'absent',
          });
        }
      }
    });

    // Convert to array and sort by date (newest first)
    return Array.from(windowsMap.values()).sort((a, b) => {
      return b.sundayDate.getTime() - a.sundayDate.getTime();
    });
  }, [records]);

  // Get color based on attendance status
  const getColor = (status: 'present' | 'absent' | 'none') => {
    if (status === 'present') {
      return 'bg-green-500';
    } else if (status === 'absent') {
      return 'bg-red-500';
    } else {
    return 'bg-gray-100';
    }
  };

  // Get tooltip text
  const getTooltip = (window: { windowId: string; sundayDate: Date; status: 'present' | 'absent' }) => {
    const dateStr = window.sundayDate.toLocaleDateString();
    const statusText = window.status === 'present' ? 'Present' : 'Absent';
    return `${dateStr}: ${statusText}`;
  };

  if (windowData.length === 0) {
    return (
      <div className={className}>
        <p className="text-gray-500 text-center py-4">No attendance records to display.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {windowData.map((window) => {
              return (
                <div
              key={window.windowId}
              className={`w-4 h-4 rounded ${getColor(window.status)} hover:ring-2 hover:ring-gray-400 cursor-pointer transition-all`}
              title={getTooltip(window)}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100" />
              <span>No Record</span>
        </div>
      </div>
    </div>
  );
}
