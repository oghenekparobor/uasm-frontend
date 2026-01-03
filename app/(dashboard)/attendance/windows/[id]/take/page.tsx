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
import { toast } from '@/hooks/use-toast';

export default function TakeAttendancePage() {
  const params = useParams();
  const windowId = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: window, loading, error, refetch } = useApi(() =>
    attendanceApi.getWindow(windowId)
  );

  // Fetch user's classes
  useEffect(() => {
    if (user?.id && window) {
      classesApi.getAll({ limit: 100 }).then((response) => {
        const allClasses = response.data.data || [];
        
        // Filter classes where user is assigned as leader
        const userClasses = allClasses.filter((cls: any) =>
          cls.classLeaders?.some((leader: any) => leader.user.id === user.id)
        );
        
        setMyClasses(userClasses);
        
        // Auto-select first class if available
        if (userClasses.length > 0) {
          setSelectedClassId(userClasses[0].id);
        }
      }).catch((error) => {
        console.error('Failed to fetch classes:', error);
      });
    }
  }, [user?.id, window]);

  // Fetch members when class is selected
  useEffect(() => {
    if (selectedClassId && windowId) {
      setLoadingMembers(true);
      attendanceApi
        .getClassMembersAttendance(selectedClassId, windowId)
        .then((response) => {
          setMembers(response.data || []);
        })
        .catch((error) => {
          console.error('Failed to fetch members:', error);
          toast.error('Failed to load class members');
        })
        .finally(() => {
          setLoadingMembers(false);
        });
    }
  }, [selectedClassId, windowId]);

  const markPresent = (memberId: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              attendance: {
                ...member.attendance,
                status: 'present',
              },
            }
          : member
      )
    );
  };

  const markAbsent = (memberId: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              attendance: {
                ...member.attendance,
                status: 'absent',
              },
            }
          : member
      )
    );
  };

  const handleSaveAttendance = async () => {
    const attendanceData = members
      .filter((m) => m.attendance?.status)
      .map((m) => ({
        memberId: m.id,
        status: m.attendance.status,
      }));

    if (attendanceData.length === 0) {
      toast.error('Please mark attendance for at least one member');
      return;
    }

    try {
      setIsSaving(true);
      await attendanceApi.bulkMarkAttendance({
        classId: selectedClassId,
        attendanceWindowId: windowId,
        attendance: attendanceData,
      });
      
      toast.success(`Attendance saved for ${attendanceData.length} members`);
      
      // Refresh members to get updated attendance
      const response = await attendanceApi.getClassMembersAttendance(selectedClassId, windowId);
      setMembers(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (!window.isOpen) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Window Closed</h2>
            <p className="text-gray-600 mb-4">
              This attendance window is not currently open.
            </p>
            <Button onClick={() => router.push('/attendance')}>
              Back to Attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (myClasses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">No Classes Assigned</h2>
            <p className="text-gray-600 mb-4">
              You are not assigned as a leader or teacher to any classes.
            </p>
            <Button onClick={() => router.push('/attendance')}>
              Back to Attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const presentCount = members.filter((m) => m.attendance?.status === 'present').length;
  const absentCount = members.filter((m) => m.attendance?.status === 'absent').length;
  const unmarkedCount = members.length - presentCount - absentCount;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push(`/attendance/windows/${windowId}`)}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">Take Attendance</h1>
          <p className="text-gray-600">
            Window: {new Date(window.sundayDate).toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={handleSaveAttendance}
          disabled={isSaving || unmarkedCount === members.length}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>

      {/* Class Selector */}
      {myClasses.length > 1 && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <label className="font-semibold">Select Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {myClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls._count?.members || 0} members)
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="text-2xl font-bold">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-green-600">Present</p>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-red-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-gray-500">Unmarked</p>
            <p className="text-2xl font-bold text-gray-500">{unmarkedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Class Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No members in this class
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const status = member.attendance?.status;
                const isPresent = status === 'present';
                const isAbsent = status === 'absent';
                
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      isPresent
                        ? 'bg-green-50 border-green-300'
                        : isAbsent
                        ? 'bg-red-50 border-red-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.birthday && (
                        <p className="text-sm text-gray-500">
                          Born: {new Date(member.birthday).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => markPresent(member.id)}
                        variant={isPresent ? 'default' : 'outline'}
                        className={isPresent ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        ✓ Present
                      </Button>
                      <Button
                        onClick={() => markAbsent(member.id)}
                        variant={isAbsent ? 'default' : 'outline'}
                        className={isAbsent ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        × Absent
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

