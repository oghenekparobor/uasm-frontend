'use client';

interface AttendanceRecord {
  id: string;
  status: 'present' | 'absent';
  markedAt: string;
  attendanceWindow?: {
    id: string;
    sundayDate: string;
  };
}

interface AttendanceStatsProps {
  records: AttendanceRecord[];
}

export function AttendanceStats({ records }: AttendanceStatsProps) {
  const stats = records.reduce(
    (acc, record) => {
      if (record.status === 'present') {
        acc.present++;
      } else if (record.status === 'absent') {
        acc.absent++;
      }
      acc.total++;
      return acc;
    },
    { present: 0, absent: 0, total: 0 }
  );

  const attendanceRate = stats.total > 0 
    ? ((stats.present / stats.total) * 100).toFixed(1)
    : '0';

  // Calculate recent attendance (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRecords = records.filter((record) => {
    const markedDate = new Date(record.markedAt);
    return markedDate >= thirtyDaysAgo;
  });

  const recentStats = recentRecords.reduce(
    (acc, record) => {
      if (record.status === 'present') {
        acc.present++;
      } else if (record.status === 'absent') {
        acc.absent++;
      }
      acc.total++;
      return acc;
    },
    { present: 0, absent: 0, total: 0 }
  );

  const recentAttendanceRate = recentStats.total > 0
    ? ((recentStats.present / recentStats.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <p className="text-sm text-gray-500 mb-1">Total Records</p>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
        <p className="text-sm text-green-700 mb-1">Present</p>
        <p className="text-2xl font-bold text-green-700">{stats.present}</p>
      </div>
      <div className="p-4 border border-gray-200 rounded-lg bg-red-50">
        <p className="text-sm text-red-700 mb-1">Absent</p>
        <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
      </div>
      <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
        <p className="text-sm text-blue-700 mb-1">Attendance Rate</p>
        <p className="text-2xl font-bold text-blue-700">{attendanceRate}%</p>
        {recentStats.total > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            Recent (30d): {recentAttendanceRate}%
          </p>
        )}
      </div>
    </div>
  );
}

