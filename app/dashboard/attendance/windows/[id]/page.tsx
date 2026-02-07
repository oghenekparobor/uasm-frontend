'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { attendanceApi, classesApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { formatDate } from '@/lib/utils/date';
import { toast } from '@/hooks/use-toast';

export default function AttendanceWindowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [attendanceOverview, setAttendanceOverview] = useState<any[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expandedClassIds, setExpandedClassIds] = useState<Set<string>>(new Set());

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const toggleMembers = (classId: string) => {
    setExpandedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };
  
  const { data: window, loading, error, refetch } = useApi(() =>
    attendanceApi.getWindow(id)
  );

  // Fetch classes - user's classes for leaders, all classes for admins
  useEffect(() => {
    if (user?.id && window) {
      classesApi.getAll({ limit: 100 }).then((response) => {
        const classes = response.data.data || [];
        setAllClasses(classes);
        
        if (isAdmin) {
          // Admins see all classes
          setMyClasses(classes);
        } else {
          // Non-admins see only their assigned classes
          const userClasses = classes.filter((cls: any) =>
          cls.classLeaders?.some((leader: any) => leader.user.id === user.id)
        );
        setMyClasses(userClasses);
        }
      }).catch((error) => {
        console.error('Failed to fetch classes:', error);
      });
    }
  }, [user?.id, user?.role, window, isAdmin]);

  // Fetch attendance overview - all classes for admins, user's classes for others
  useEffect(() => {
    if (window && myClasses.length > 0) {
      setLoadingOverview(true);
      Promise.all(
        myClasses.map((cls) =>
          attendanceApi
            .getClassMembersAttendance(cls.id, id)
            .then((response) => ({
              class: cls,
              members: response.data || [],
            }))
            .catch(() => ({
              class: cls,
              members: [],
            }))
        )
      )
        .then((results) => {
          setAttendanceOverview(results);
        })
        .finally(() => {
          setLoadingOverview(false);
        });
    }
  }, [window, myClasses, id]);

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
            Attendance Window - {formatDate(window.sundayDate)}
          </h1>
          <p className="text-gray-600">Attendance Window Details</p>
        </div>
        <div className="flex gap-3">
          {window.isOpen && myClasses.length > 0 && (
            <Button
              onClick={() => router.push(`/dashboard/attendance/windows/${id}/take`)}
              size="lg"
            >
              Take Attendance
            </Button>
          )}
        {window.isOpen && (
          <Button variant="outline">Close Window</Button>
        )}
        </div>
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
                {formatDate(window.sundayDate)}
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
                {formatDate(window.opensAt, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Closes At</p>
              <p className="font-semibold">
                {formatDate(window.closesAt, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
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
            {(() => {
              const totalMembers = attendanceOverview.reduce(
                (sum, item) => sum + item.members.length,
                0
              );
              const presentCount = attendanceOverview.reduce(
                (sum, item) =>
                  sum +
                  item.members.filter((m: any) => m.attendance?.status === 'present').length,
                0
              );
              const absentCount = attendanceOverview.reduce(
                (sum, item) =>
                  sum +
                  item.members.filter((m: any) => m.attendance?.status === 'absent').length,
                0
              );
              const markedCount = presentCount + absentCount;

              return (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Total Members</p>
                    <p className="text-2xl font-bold">{totalMembers}</p>
                  </div>
            <div>
                    <p className="text-sm text-gray-500">Attendance Marked</p>
              <p className="text-2xl font-bold">
                      {markedCount} / {totalMembers}
              </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-sm text-green-600">Present</p>
                      <p className="text-xl font-bold text-green-600">{presentCount}</p>
            </div>
            <div>
                      <p className="text-sm text-red-600">Absent</p>
                      <p className="text-xl font-bold text-red-600">{absentCount}</p>
                    </div>
            </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      {attendanceOverview.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOverview ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {attendanceOverview.map((item) => {
                  const present = item.members.filter(
                    (m: any) => m.attendance?.status === 'present'
                  ).length;
                  const absent = item.members.filter(
                    (m: any) => m.attendance?.status === 'absent'
                  ).length;
                  const unmarked = item.members.length - present - absent;
                  const marked = present + absent;

                  return (
                    <div
                      key={item.class.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{item.class.name}</h3>
                          <p className="text-sm text-gray-500">
                            Type: {item.class.type} | Total Members: {item.members.length}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Marked</p>
                          <p className="text-xl font-bold">
                            {marked} / {item.members.length}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Present</p>
                          <p className="text-2xl font-bold text-green-600">{present}</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600 font-medium">Absent</p>
                          <p className="text-2xl font-bold text-red-600">{absent}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Unmarked</p>
                          <p className="text-2xl font-bold text-gray-600">{unmarked}</p>
                        </div>
                      </div>

                      {marked > 0 && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => toggleMembers(item.class.id)}
                            className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                            aria-expanded={expandedClassIds.has(item.class.id)}
                            aria-controls={`members-${item.class.id}`}
                          >
                            <span
                              className={`inline-block transition-transform ${expandedClassIds.has(item.class.id) ? 'rotate-90' : ''}`}
                              aria-hidden
                            >
                              ▶
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {expandedClassIds.has(item.class.id) ? 'Hide members' : `See members (${marked})`}
                            </span>
                          </button>
                          {expandedClassIds.has(item.class.id) && (
                            <div
                              id={`members-${item.class.id}`}
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2"
                            >
                              {item.members.map((member: any) => {
                                const status = member.attendance?.status;
                                return (
                                  <div
                                    key={member.id}
                                    className={`flex items-center justify-between p-2 rounded text-sm ${
                                      status === 'present'
                                        ? 'bg-green-50 text-green-700'
                                        : status === 'absent'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-gray-50 text-gray-500'
                                    }`}
                                  >
                                    <span>
                                      {member.firstName} {member.lastName}
                                    </span>
                                    <span className="ml-2">
                                      {status === 'present' ? '✓' : status === 'absent' ? '×' : '○'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Attendance Records (for admins or viewing past submissions) */}
      {window.classAttendance && window.classAttendance.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {window.classAttendance.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{record.class?.name}</p>
                    <p className="text-sm text-gray-500">
                      Count: {record.count} | Submitted by: {record.user?.firstName}{' '}
                      {record.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(record.takenAt).toLocaleString()}
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

