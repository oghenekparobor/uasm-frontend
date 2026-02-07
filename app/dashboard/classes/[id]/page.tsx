'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { classesApi, usersApi, offeringsApi, attendanceApi } from '@/lib/api-services';
import { useApi, usePaginatedApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { ClassForm } from '@/components/forms/class-form';
import { OfferingForm } from '@/components/forms/offering-form';
import { Select } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { ROLES } from '@/lib/constants';

const LEADER_ROLES = [
  { value: 'LEADER', label: 'Leader' },
  { value: 'ASSISTANT', label: 'Assistant' },
  { value: 'TEACHER', label: 'Teacher' },
];

export default function ClassDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignLeaderModalOpen, setIsAssignLeaderModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<any>(null);
  const [currentWindow, setCurrentWindow] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const { data: classData, loading, error, refetch } = useApi(() =>
    classesApi.getOne(id)
  );

  // Fetch current attendance window
  useEffect(() => {
    attendanceApi.getCurrentWindow()
      .then((response) => {
        setCurrentWindow(response.data);
      })
      .catch(() => {
        // Current window may not exist, that's okay
      });
  }, []);

  // Fetch offerings for this class
  const { data: offerings, loading: offeringsLoading, refetch: refetchOfferings } = usePaginatedApi<Record<string, unknown>>(
    (params) => offeringsApi.getAll({ ...params, classId: id }),
    { page: 1, limit: 100, sortBy: 'recordedAt', sortOrder: 'desc' }
  );

  // Calculate totals from offerings
  const totals = offerings ? {
    totalOffering: offerings.reduce((sum: number, o: any) => sum + (o.offeringAmount || 0), 0),
    totalTithe: offerings.reduce((sum: number, o: any) => sum + (o.titheAmount || 0), 0),
  } : null;

  // Fetch users when assign leader modal opens
  useEffect(() => {
    if (isAssignLeaderModalOpen) {
      // Fetch users with leadership/teaching roles
      usersApi.getAll({ 
        limit: 100,
        roles: 'platoon_leader,assistant_platoon_leader,children_teacher,admin,super_admin'
      }).then((response) => {
        setUsers(response.data.data || []);
      }).catch((error) => {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      });
    }
  }, [isAssignLeaderModalOpen]);

  const handleAssignLeader = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error('Please select both a user and a role');
      return;
    }

    try {
      setIsAssigning(true);
      await classesApi.assignLeader(id, {
        userId: selectedUserId,
        role: selectedRole,
      });
      toast.success('Leader assigned successfully');
      setIsAssignLeaderModalOpen(false);
      setSelectedUserId('');
      setSelectedRole('');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign leader');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveLeader = async (userId: string, role: string) => {
    if (!confirm(`Are you sure you want to remove this ${role.toLowerCase()}?`)) {
      return;
    }

    try {
      await classesApi.removeLeader(id, userId, role);
      toast.success('Leader removed successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove leader');
    }
  };

  const handleDeleteClass = async () => {
    const memberCount = classData?._count?.members ?? 0;
    const message =
      memberCount > 0
        ? `Remove this class? This will permanently delete the class and all ${memberCount} member(s). This cannot be undone.`
        : `Remove this class? This cannot be undone.`;
    if (!confirm(message)) return;
    try {
      setIsDeleting(true);
      await classesApi.delete(id);
      toast.success('Class and all its members removed successfully');
      router.push('/classes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove class');
    } finally {
      setIsDeleting(false);
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

  if (!classData) {
    return <ErrorState message="Class not found" />;
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
          <h1 className="text-4xl font-bold mb-2">{classData.name}</h1>
          <p className="text-gray-600">Class Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline"
              onClick={handleDeleteClass}
              disabled={isDeleting}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              {isDeleting ? 'Removing...' : 'Remove Class'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold">{classData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold">{classData.type}</p>
            </div>
            {classData._count && (
              <div>
                <p className="text-sm text-gray-500">Current Members</p>
                <p className="font-semibold">{classData._count.members || 0}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Class ID</p>
              <p className="font-mono text-sm">{classData.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Leaders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle>Leaders & Teachers</CardTitle>
              <Button
                size="sm"
                onClick={() => setIsAssignLeaderModalOpen(true)}
              >
                Assign Leader
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {classData.classLeaders && classData.classLeaders.length > 0 ? (
              <div className="space-y-2">
                {classData.classLeaders.map((leader: any) => (
                  <div key={leader.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    <div>
                      <p className="font-semibold">
                        {leader.user?.firstName} {leader.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{leader.role}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveLeader(leader.user.id, leader.role)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1"
                      title="Remove leader"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No leaders assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members - collapsible */}
      <Card>
        <CardHeader className="pb-2">
          <button
            type="button"
            onClick={() => setMembersExpanded((prev) => !prev)}
            className="flex items-center gap-2 w-full text-left rounded-lg hover:bg-gray-50 active:bg-gray-100 -mx-2 px-2 py-1.5 transition-colors touch-manipulation"
            aria-expanded={membersExpanded}
          >
            <span
              className={`inline-block transition-transform ${membersExpanded ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ▶
            </span>
            <CardTitle className="!mb-0">
              Members ({classData.members?.length || 0})
            </CardTitle>
          </button>
        </CardHeader>
        <CardContent>
          {classData.members && classData.members.length > 0 ? (
            <>
              {membersExpanded ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classData.members.map((member: any) => (
                    <div
                      key={member.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/members/${member.id}`)}
                    >
                      <p className="font-semibold">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.birthday && (
                        <p className="text-sm text-gray-500">
                          {new Date(member.birthday).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Tap to expand and view {classData.members.length} member{classData.members.length !== 1 ? 's' : ''}.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No members in this class</p>
          )}
        </CardContent>
      </Card>

      {/* Offerings & Tithe */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Offerings & Tithe</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setSelectedOffering(null);
                setIsOfferingModalOpen(true);
              }}
            >
              Record Offering
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {totals && (
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total Offering</p>
                <p className="text-2xl font-bold">₦{(totals.totalOffering || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tithe</p>
                <p className="text-2xl font-bold">₦{(totals.totalTithe || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}
          
          {offeringsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : !offerings || offerings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No offering records found for this class.
            </p>
          ) : (
            <div className="space-y-4">
              {offerings.map((offering: any) => (
                <div
                  key={offering.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <p className="font-semibold">
                          {offering.attendanceWindow?.sundayDate
                            ? new Date(offering.attendanceWindow.sundayDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-gray-500">Offering</p>
                          <p className="font-semibold">₦{(offering.offeringAmount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tithe</p>
                          <p className="font-semibold">₦{(offering.titheAmount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      {offering.notes && (
                        <p className="text-sm text-gray-600 mb-2">{offering.notes}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>
                          Recorded: {new Date(offering.recordedAt).toLocaleDateString()}
                        </span>
                        {offering.user && (
                          <span>
                            by {offering.user.firstName} {offering.user.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOffering(offering);
                        setIsOfferingModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Class"
        size="md"
      >
        <ClassForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsEditModalOpen(false);
          }}
          initialData={classData}
        />
      </Modal>

      {/* Assign Leader Modal */}
      <Modal
        isOpen={isAssignLeaderModalOpen}
        onClose={() => {
          setIsAssignLeaderModalOpen(false);
          setSelectedUserId('');
          setSelectedRole('');
        }}
        title="Assign Leader"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Select User"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            options={[
              { value: '', label: 'Choose a user...' },
              ...users.map((user) => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName} (${user.email})`,
              })),
            ]}
          />
          
          <Select
            label="Select Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={[
              { value: '', label: 'Choose a role...' },
              ...LEADER_ROLES.map((role) => ({
                value: role.value,
                label: role.label,
              })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignLeaderModalOpen(false);
                setSelectedUserId('');
                setSelectedRole('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignLeader}
              disabled={!selectedUserId || !selectedRole || isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign Leader'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Offering Modal */}
      <Modal
        isOpen={isOfferingModalOpen}
        onClose={() => {
          setIsOfferingModalOpen(false);
          setSelectedOffering(null);
        }}
        title={selectedOffering ? 'Edit Offering Record' : 'Record Offering & Tithe'}
        size="md"
      >
        <OfferingForm
          isOpen={isOfferingModalOpen}
          onClose={() => {
            setIsOfferingModalOpen(false);
            setSelectedOffering(null);
          }}
          onSuccess={() => {
            refetchOfferings();
            setIsOfferingModalOpen(false);
            setSelectedOffering(null);
          }}
          classId={id}
          attendanceWindowId={currentWindow?.id}
          initialData={selectedOffering}
        />
      </Modal>
    </div>
  );
}

