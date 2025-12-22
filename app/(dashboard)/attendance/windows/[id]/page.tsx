'use client';

import { useRouter, useParams } from 'next/navigation';
import { attendanceApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

export default function AttendanceWindowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: window, loading, error, refetch } = useApi(() =>
    attendanceApi.getWindow(id)
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

  if (!window) {
    return <ErrorState message="Attendance window not found" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">
            Attendance Window - {new Date(window.sundayDate).toLocaleDateString()}
          </h1>
          <p className="text-gray-600">Attendance Window Details</p>
        </div>
        {window.isOpen && (
          <Button variant="outline">Close Window</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Window Information */}
        <Card>
          <CardHeader>
            <CardTitle>Window Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Sunday Date</p>
              <p className="font-semibold">
                {new Date(window.sundayDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">
                <span
                  className={`px-2 py-1 rounded ${
                    window.isOpen
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {window.isOpen ? 'Open' : 'Closed'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Opens At</p>
              <p className="font-semibold">
                {new Date(window.opensAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Closes At</p>
              <p className="font-semibold">
                {new Date(window.closesAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Attendance Records</p>
              <p className="text-2xl font-bold">
                {window.attendanceRecords?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Window ID</p>
              <p className="font-mono text-sm">{window.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      {window.attendanceRecords && window.attendanceRecords.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {window.attendanceRecords.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{record.class?.name}</p>
                    <p className="text-sm text-gray-500">
                      Count: {record.count} | Submitted:{' '}
                      {new Date(record.createdAt).toLocaleString()}
                    </p>
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

