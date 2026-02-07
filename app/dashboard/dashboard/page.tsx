'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { UpcomingBirthdays } from '@/components/dashboard/upcoming-birthdays';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<string>('all');
  const { overview, stats, loading, error } = useDashboard(period);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || 'User'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Here's what's happening with your account today.
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Members
            </h3>
            <p className="text-3xl font-bold">
              {overview?.members?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Classes
            </h3>
            <p className="text-3xl font-bold">
              {overview?.classes?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Workers
            </h3>
            <p className="text-3xl font-bold">
              {overview?.users?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Pending Approvals
            </h3>
            <p className="text-3xl font-bold">
              {stats?.pendingApprovals?.total?.toLocaleString() || '0'}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.pendingApprovals?.empowermentRequests || 0} empowerments,{' '}
              {stats?.pendingApprovals?.generalRequests || 0} requests,{' '}
              {stats?.pendingApprovals?.events || 0} events
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Stats */}
      {stats?.platoonStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Platoon Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-2xl font-bold">
                  {stats.platoonStats.totalMembers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-2xl font-bold">
                  {stats.platoonStats.totalAttendance}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Logs</p>
                <p className="text-2xl font-bold">
                  {stats.platoonStats.totalLogs}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Empowerments</p>
                <p className="text-2xl font-bold">
                  {stats.platoonStats.totalEmpowerments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.distributionStats && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Distribution Statistics</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/distribution/analytics')}
              >
                View Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Batches</p>
                <p className="text-2xl font-bold">
                  {stats.distributionStats.totalBatches}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Food Received</p>
                <p className="text-2xl font-bold">
                  {stats.distributionStats.totalFoodReceived?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Food Allocated</p>
                <p className="text-2xl font-bold">
                  {stats.distributionStats.totalFoodAllocated?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Food Remaining</p>
                <p className="text-2xl font-bold">
                  {stats.distributionStats.foodRemaining?.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.kitchenStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kitchen Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Recipes</p>
                <p className="text-2xl font-bold">
                  {stats.kitchenStats.totalRecipes}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Production Logs</p>
                <p className="text-2xl font-bold">
                  {stats.kitchenStats.totalProductionLogs}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Production</p>
                <p className="text-2xl font-bold">
                  {stats.kitchenStats.totalProduction?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-2xl font-bold">
                  {Math.round(stats.kitchenStats.averageProduction || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.systemStats?.offeringsStats && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Offerings & Tithe Statistics</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/offerings/analytics')}
              >
                View Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold">
                  {stats.systemStats.offeringsStats.totalRecords}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Offering</p>
                <p className="text-2xl font-bold">
                  ₦{(stats.systemStats.offeringsStats.totalOffering || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tithe</p>
                <p className="text-2xl font-bold">
                  ₦{(stats.systemStats.offeringsStats.totalTithe || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Combined</p>
                <p className="text-2xl font-bold">
                  ₦{(stats.systemStats.offeringsStats.totalCombined || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Birthdays and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingBirthdays upcomingDays={7} />

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">
                      {activity.actor?.firstName} {activity.actor?.lastName}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
