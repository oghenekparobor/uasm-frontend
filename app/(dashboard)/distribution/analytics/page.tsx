'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DistributionAnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<string>('all');
  const { data: analytics, loading, error, refetch } = useApi(() =>
    dashboardApi.getDistributionAnalytics(period)
  );

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
  const foodUtilizationData = [
    {
      name: 'Allocated',
      value: analytics.summary.totalFoodAllocated,
      color: '#10b981',
    },
    {
      name: 'Remaining',
      value: analytics.summary.foodRemaining,
      color: '#f59e0b',
    },
  ];

  const waterUtilizationData = [
    {
      name: 'Allocated',
      value: analytics.summary.totalWaterAllocated,
      color: '#3b82f6',
    },
    {
      name: 'Remaining',
      value: analytics.summary.waterRemaining,
      color: '#60a5fa',
    },
  ];

  const monthlyFoodData = analytics.byMonth.map((item: any) => ({
    month: new Date(item.monthKey + '-01').toLocaleDateString('en-US', {
      month: 'short',
    }),
    received: item.totalFoodReceived,
    allocated: item.totalFoodAllocated,
    remaining: item.totalFoodReceived - item.totalFoodAllocated,
  }));

  const monthlyWaterData = analytics.byMonth.map((item: any) => ({
    month: new Date(item.monthKey + '-01').toLocaleDateString('en-US', {
      month: 'short',
    }),
    received: item.totalWaterReceived,
    allocated: item.totalWaterAllocated,
    remaining: item.totalWaterReceived - item.totalWaterAllocated,
  }));

  const classFoodData = analytics.byClass.slice(0, 10).map((item: any) => ({
    name: item.className,
    allocated: item.totalFoodAllocated,
  }));

  const classWaterData = analytics.byClass.slice(0, 10).map((item: any) => ({
    name: item.className,
    allocated: item.totalWaterAllocated,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Distribution Analytics
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Detailed breakdown of food and water distribution statistics.
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
              Total Batches
            </h3>
            <p className="text-3xl font-bold">
              {analytics.summary.totalBatches.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Food Received
            </h3>
            <p className="text-3xl font-bold">
              {analytics.summary.totalFoodReceived.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Food Allocated
            </h3>
            <p className="text-3xl font-bold">
              {analytics.summary.totalFoodAllocated.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.summary.utilizationRate}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Food Remaining
            </h3>
            <p className="text-3xl font-bold">
              {analytics.summary.foodRemaining.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Food Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={foodUtilizationData}
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
                  {foodUtilizationData.map((entry, index) => (
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
            <CardTitle>Water Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={waterUtilizationData}
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
                  {waterUtilizationData.map((entry, index) => (
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
      </div>

      {/* Charts Row 2: Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Food Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyFoodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="received" fill="#3b82f6" name="Received" />
                <Bar dataKey="allocated" fill="#10b981" name="Allocated" />
                <Bar dataKey="remaining" fill="#f59e0b" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Water Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyWaterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="received" fill="#3b82f6" name="Received" />
                <Bar dataKey="allocated" fill="#10b981" name="Allocated" />
                <Bar dataKey="remaining" fill="#60a5fa" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: By Class */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Food Allocation by Class (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classFoodData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="allocated" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Water Allocation by Class (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classWaterData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="allocated" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* By Class Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Breakdown by Class</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.byClass.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No distribution data available for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Class
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Allocations
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Food Allocated
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Water Allocated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.byClass.map((item: any) => (
                    <tr
                      key={item.classId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {item.className}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.classType}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.allocationCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {item.totalFoodAllocated.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {item.totalWaterAllocated.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-sm font-bold text-gray-700"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.byClass.reduce(
                        (sum: number, item: any) => sum + item.allocationCount,
                        0
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.summary.totalFoodAllocated.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.summary.totalWaterAllocated.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Month Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Breakdown by Month</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.byMonth.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No monthly data available for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Month
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Batches
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Food Received
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Food Allocated
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Water Received
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Water Allocated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.byMonth.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {item.month}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.batches}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {item.totalFoodReceived.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {item.totalFoodAllocated.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {item.totalWaterReceived.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {item.totalWaterAllocated.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.summary.totalBatches}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.summary.totalFoodReceived.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.summary.totalFoodAllocated.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.summary.totalWaterReceived.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {analytics.summary.totalWaterAllocated.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Batches */}
      {analytics.byBatch && analytics.byBatch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Sunday Date
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Food Received
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Food Allocated
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Food Remaining
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Water Received
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Water Allocated
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Allocations
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.byBatch.map((batch: any) => (
                    <tr
                      key={batch.batchId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">
                        {formatDate(batch.sundayDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {batch.totalFoodReceived.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {batch.totalFoodAllocated.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span
                          className={
                            batch.foodRemaining < 0
                              ? 'text-red-600 font-medium'
                              : ''
                          }
                        >
                          {batch.foodRemaining.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {batch.totalWaterReceived.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {batch.totalWaterAllocated.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {batch.allocationCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

