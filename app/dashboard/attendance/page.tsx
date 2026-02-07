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
    <div className="min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Attendance</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track and manage attendance records.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
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
                size="sm"
                className="w-full sm:w-auto shrink-0"
                onClick={() => router.push('/attendance/analytics')}
              >
                View Analytics
              </Button>
              <Button
                size="sm"
                className="w-full sm:w-auto shrink-0"
                onClick={() => setIsOpenWindowModalOpen(true)}
              >
                Open Window
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Current Window */}
      {currentWindow && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6 pb-0">
            <CardTitle className="text-lg sm:text-xl">Current Attendance Window</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {formatDate(currentWindow.sundayDate)}
                </p>
                <p className="text-sm text-gray-500">
                  {currentWindow.isOpen ? 'Open' : 'Closed'}
                </p>
              </div>
              {currentWindow.isOpen && (
                <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
                  Close Window
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Windows */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0">
          <CardTitle className="text-lg sm:text-xl">Attendance Windows</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {!windows || windows.length === 0 ? (
            <p className="text-gray-500 text-sm">No attendance windows found.</p>
          ) : (
            <div className="w-full min-w-0">
              <div
                className="overflow-x-auto overflow-y-visible border border-gray-200 rounded-lg overscroll-x-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <table className="w-full min-w-[520px] border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                        Sunday Date
                      </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                        Opens At
                      </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                        Closes At
                      </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
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
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                          {formatDate(window.sundayDate)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 sm:py-1 rounded text-xs ${
                              window.isOpen
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {window.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
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
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
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
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
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
