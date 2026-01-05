'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { attendanceApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { OpenWindowForm } from '@/components/forms/attendance-form';
import { formatDate } from '@/lib/utils/date';
import { toast } from '@/hooks/use-toast';
import { ExportButton } from '@/components/tables';

export default function AttendancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOpenWindowModalOpen, setIsOpenWindowModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const { data: windows, loading, error, refetch } = useApi(
    attendanceApi.getWindows
  );
  const { data: currentWindow, refetch: refetchCurrent } = useApi(
    attendanceApi.getCurrentWindow
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Attendance</h1>
          <p className="text-gray-600">Track and manage attendance records.</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={[]}
            columns={[]}
            filename="attendance"
            serverExport={{
              type: 'attendance',
            }}
          />
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push('/attendance/analytics')}
              >
                View Analytics
              </Button>
              <Button onClick={() => setIsOpenWindowModalOpen(true)}>
                Open Window
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Current Window */}
      {currentWindow && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Attendance Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {formatDate(currentWindow.sundayDate)}
                </p>
                <p className="text-sm text-gray-500">
                  {currentWindow.isOpen ? 'Open' : 'Closed'}
                </p>
              </div>
              {currentWindow.isOpen && (
                <Button variant="outline">Close Window</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Windows */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Windows</CardTitle>
        </CardHeader>
        <CardContent>
          {!windows || windows.length === 0 ? (
            <p className="text-gray-500">No attendance windows found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Sunday Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Opens At
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Closes At
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {windows.map((window: any) => (
                    <tr
                      key={window.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">
                        {formatDate(window.sundayDate)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            window.isOpen
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {window.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {window.opensAt
                          ? formatDate(window.opensAt, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {window.closesAt
                          ? formatDate(window.closesAt, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/attendance/windows/${window.id}`)
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
          )}
        </CardContent>
      </Card>

      {/* Open Window Modal */}
      <Modal
        isOpen={isOpenWindowModalOpen}
        onClose={() => setIsOpenWindowModalOpen(false)}
        title="Open Attendance Window"
        size="md"
      >
        <OpenWindowForm
          isOpen={isOpenWindowModalOpen}
          onClose={() => setIsOpenWindowModalOpen(false)}
          onSuccess={() => {
            refetch();
            refetchCurrent();
            setIsOpenWindowModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
