'use client';

import { useMemo, useState } from 'react';

interface AttendanceRecord {
  id: string;
  status: 'present' | 'absent';
  markedAt: string;
  attendanceWindow?: {
    sundayDate: string;
  };
}

interface AttendanceHeatmapProps {
  records: AttendanceRecord[];
  className?: string;
}

export function AttendanceHeatmap({ records, className }: AttendanceHeatmapProps) {
  // Get available years from records
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    records.forEach((record) => {
      const date = record.attendanceWindow?.sundayDate || record.markedAt;
      if (date) {
        years.add(new Date(date).getFullYear());
      }
    });
    // Add current year and last year if no records
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [records]);

  const [selectedYear, setSelectedYear] = useState<number>(
    availableYears[0] || new Date().getFullYear()
  );
  // Group records by week (Sunday date of the attendance window)
  const attendanceByWeek = useMemo(() => {
    const map = new Map<string, { present: number; absent: number }>();
    
    records.forEach((record) => {
      // Use the Sunday date from the attendance window as the week key
      const sundayDate = record.attendanceWindow?.sundayDate;
      if (!sundayDate) return; // Skip records without a Sunday date
      
      const dateKey = new Date(sundayDate).toISOString().split('T')[0];
      const current = map.get(dateKey) || { present: 0, absent: 0 };
      
      if (record.status === 'present') {
        current.present++;
      } else {
        current.absent++;
      }
      
      map.set(dateKey, current);
    });
    
    return map;
  }, [records]);

  // Generate calendar data for the selected year (weekly view)
  const calendarData = useMemo(() => {
    // Start from the first Sunday of the selected year (or the Sunday before January 1st)
    const startDate = new Date(selectedYear, 0, 1);
    const dayOfWeek = startDate.getDay();
    const firstSunday = new Date(startDate);
    if (dayOfWeek !== 0) {
      firstSunday.setDate(startDate.getDate() - dayOfWeek);
    }
    firstSunday.setHours(0, 0, 0, 0);
    
    // End on the last Sunday of the selected year (or the Sunday after December 31st)
    const endDate = new Date(selectedYear, 11, 31);
    const endDayOfWeek = endDate.getDay();
    const lastSunday = new Date(endDate);
    if (endDayOfWeek !== 0) {
      lastSunday.setDate(endDate.getDate() + (7 - endDayOfWeek));
    }
    lastSunday.setHours(0, 0, 0, 0);
    
    // Generate weeks (one entry per week, represented by the Sunday date)
    const weeks: Array<{ date: Date; present: number; absent: number; total: number }> = [];
    const currentSunday = new Date(firstSunday);
    
    while (currentSunday <= lastSunday) {
      const dateKey = currentSunday.toISOString().split('T')[0];
      const attendance = attendanceByWeek.get(dateKey) || { present: 0, absent: 0 };
      weeks.push({
        date: new Date(currentSunday),
        present: attendance.present,
        absent: attendance.absent,
        total: attendance.present + attendance.absent,
      });
      // Move to next Sunday
      currentSunday.setDate(currentSunday.getDate() + 7);
    }
    
    return weeks;
  }, [attendanceByWeek, selectedYear]);

  // Get color based on attendance status
  const getColor = (total: number, present: number, absent: number) => {
    if (total === 0) {
      // No record - grey
      return 'bg-gray-100';
    }
    
    if (present > 0 && absent === 0) {
      // Only present - green
      return 'bg-green-500';
    } else if (absent > 0 && present === 0) {
      // Only absent - red
      return 'bg-red-500';
    } else if (present > 0 && absent > 0) {
      // Mixed - use green if more present, red if more absent
      return present >= absent ? 'bg-green-500' : 'bg-red-500';
    }
    
    return 'bg-gray-100';
  };

  // Get month labels (based on the Sunday dates)
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;
    
    calendarData.forEach((week, weekIndex) => {
      const sundayDate = week.date;
      const month = sundayDate.getMonth();
      
      // Show month label on the first Sunday of each month (or close to it)
      if (month !== lastMonth && sundayDate.getDate() <= 7) {
        labels.push({ month: months[month], weekIndex });
        lastMonth = month;
      }
    });
    
    return labels;
  }, [calendarData]);

  return (
    <div className={className}>
      {/* Year Selector */}
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
          Year:
        </label>
        <select
          id="year-select"
          value={selectedYear.toString()}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableYears.map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-start gap-2">
        {/* Calendar grid */}
        <div className="flex-1">
          {/* Month labels */}
          <div className="flex gap-1 mb-1 relative h-4">
            {monthLabels.map(({ month, weekIndex }) => (
              <div
                key={`${month}-${weekIndex}`}
                className="text-xs text-gray-500 absolute"
                style={{ left: `${(weekIndex / calendarData.length) * 100}%` }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Calendar grid - Weekly view (each square represents a week) */}
          <div className="flex gap-1 flex-wrap">
            {calendarData.map((week, weekIndex) => {
              const dateKey = week.date.toISOString().split('T')[0];
              const attendance = attendanceByWeek.get(dateKey);
              const weekStart = week.date;
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              const tooltipText = attendance
                ? `Week of ${weekStart.toLocaleDateString()}: ${attendance.present} present, ${attendance.absent} absent`
                : `Week of ${weekStart.toLocaleDateString()}: No attendance`;
              
              return (
                <div
                  key={weekIndex}
                  className={`w-3 h-3 rounded ${getColor(week.total, week.present, week.absent)} hover:ring-2 hover:ring-gray-400 cursor-pointer transition-all`}
                  title={tooltipText}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <span>No Record</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

