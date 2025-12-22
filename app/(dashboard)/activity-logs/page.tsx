'use client';

import { activityLogsApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';

export default function ActivityLogsPage() {
  const { data: logs, loading, error, refetch } = usePaginatedApi(
    activityLogsApi.getAll,
    { page: 1, limit: 50 }
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Activity Logs</h1>
        <p className="text-gray-600">
          View system activity and audit logs.
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <EmptyState
          title="No activity logs found"
          description="Activity logs will appear here as actions are performed."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-gray-500">
                      {log.actor?.firstName} {log.actor?.lastName} •{' '}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    {log.entityType && (
                      <p className="text-xs text-gray-400 mt-1">
                        {log.entityType}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
