'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/utils/date';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AttendanceAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<string>('all');
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const { data: analytics, loading, error, refetch } = useApi(() =>
    dashboardApi.getAttendanceAnalytics(period)
  );

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/attendance');
    }
  }, [user, isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorState message="You do not have permission to access this page." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} retry={refetch} />;
  }

  if (!analytics) {
    return <ErrorState message="No analytics data available" />;
  }

  // Prepare chart data
  const statusDistributionData = [
    {
      name: 'Present',
      value: analytics.summary.presentCount,
      color: '#10b981',
    },
    {
      name: 'Absent',
      value: analytics.summary.absentCount,
      color: '#ef4444',
    },
  ];

  const monthlyAttendanceData = analytics.byMonth.map((item: any) => ({
    month: new Date(item.monthKey + '-01').toLocaleDateString('en-US', {
      month: 'short',
    }),
    present: item.presentCount,
    absent: item.absentCount,
    rate: parseFloat(item.attendanceRate),
  }));

  const classAttendanceData = analytics.byClass.slice(0, 10).map((item: any) => ({
    name: item.className.length > 15 
      ? item.className.substring(0, 15) + '...' 
      : item.className,
    present: item.presentCount,
    absent: item.absentCount,
    rate: parseFloat(item.attendanceRate),
  }));

  const dailyTrendsData = analytics.dailyTrends.map((item: any) => ({
    date: item.date,
    rate: parseFloat(item.attendanceRate),
    present: item.presentCount,
    absent: item.absentCount,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push('/attendance')}
            className="mb-4"
          >
            ← Back to Attendance
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Attendance Analytics
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Detailed breakdown of member attendance statistics and trends.
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Records
            </h3>
            <p className="text-3xl font-bold">
              {analytics.summary.totalRecords.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Present
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics.summary.presentCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Absent
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {analytics.summary.absentCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Attendance Rate
            </h3>
            <p className="text-3xl font-bold">
              {analytics.summary.attendanceRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Status Distribution & Daily Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: any) => `${value}%`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Attendance Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Monthly Trends & Top Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Classes by Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={classAttendanceData}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Legend />
                <Bar dataKey="rate" fill="#3b82f6" name="Attendance Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Class Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Breakdown by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Class Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Total Records
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Present
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Absent
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.byClass.map((item: any) => (
                  <tr key={item.classId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.className}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.classType}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.totalRecords.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      {item.presentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {item.absentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {item.attendanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by Month Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Breakdown by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Total Records
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Present
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Absent
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.byMonth.map((item: any) => (
                  <tr key={item.monthKey} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.month}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.totalRecords.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      {item.presentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {item.absentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {item.attendanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Windows Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Windows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Sunday Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Total Records
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Present
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Absent
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Attendance Rate
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.byWindow.map((item: any) => (
                  <tr key={item.windowId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatDate(item.sundayDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.totalRecords.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      {item.presentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {item.absentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {item.attendanceRate}%
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/attendance/windows/${item.windowId}`)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

