'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

export default function OfferingsAnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<string>('all');
  const { data: analytics, loading, error, refetch } = useApi(() =>
    dashboardApi.getOfferingsAnalytics(period)
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

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
            Offerings & Tithe Analytics
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Detailed breakdown of offerings and tithe statistics.
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
              Total Offering
            </h3>
            <p className="text-3xl font-bold">
              {formatCurrency(analytics.summary.totalOffering)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Tithe
            </h3>
            <p className="text-3xl font-bold">
              {formatCurrency(analytics.summary.totalTithe)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Combined
            </h3>
            <p className="text-3xl font-bold">
              {formatCurrency(analytics.summary.totalCombined)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* By Class */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Breakdown by Class</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.byClass.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No offerings data available for this period.
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
                      Records
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Total Offering
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Total Tithe
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Combined
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
                        {item.recordCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.totalOffering)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.totalTithe)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold">
                        {formatCurrency(item.totalCombined)}
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
                      {analytics.summary.totalRecords}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {formatCurrency(analytics.summary.totalOffering)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {formatCurrency(analytics.summary.totalTithe)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {formatCurrency(analytics.summary.totalCombined)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Month */}
      <Card>
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
                      Records
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Total Offering
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Total Tithe
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Combined
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
                        {item.recordCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.totalOffering)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.totalTithe)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold">
                        {formatCurrency(item.totalCombined)}
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
                      {analytics.summary.totalRecords}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {formatCurrency(analytics.summary.totalOffering)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {formatCurrency(analytics.summary.totalTithe)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {formatCurrency(analytics.summary.totalCombined)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

