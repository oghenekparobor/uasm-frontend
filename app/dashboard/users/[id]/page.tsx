'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { UserForm } from '@/components/forms/user-form';
import { Select } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

function formatRoleLabel(name: string): string {
  return name
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
}

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allRoles, setAllRoles] = useState<{ id: number; name: string }[]>([]);
  const { data: user, loading, error, refetch } = useApi(() =>
    usersApi.getOne(id)
  );

  useEffect(() => {
    usersApi
      .getRoles()
      .then((res) => setAllRoles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAllRoles([]));
  }, []);

  const handleAssignRole = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    try {
      setIsAssigningRole(true);
      await usersApi.assignRole(id, { roleId: parseInt(selectedRoleId) });
      toast.success('Role assigned successfully');
      setIsAddRoleModalOpen(false);
      setSelectedRoleId('');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign role');
    } finally {
      setIsAssigningRole(false);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to remove this role?')) {
      return;
    }

    try {
      await usersApi.removeRole(id, roleId.toString());
      toast.success('Role removed successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove role');
    }
  };

  const handleDeleteUser = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${user?.firstName} ${user?.lastName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await usersApi.delete(id);
      toast.success('User deleted successfully');
      router.push('/users');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to delete user'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Get roles that can be assigned (not already assigned) – use DB roles so IDs match
  const assignedRoleNames = user?.roles?.map((r: any) => r.role) || [];
  const availableRolesToAssign = allRoles.filter(
    (role) => !assignedRoleNames.includes(role.name)
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

  if (!user) {
    return <ErrorState message="User not found" />;
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
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600">User Profile</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline"
              onClick={handleDeleteUser}
              disabled={isDeleting || currentUser?.id === id}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-semibold">{user.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-semibold">{user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roles & Permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle>Roles & Permissions</CardTitle>
              <Button
                size="sm"
                onClick={() => setIsAddRoleModalOpen(true)}
                disabled={availableRolesToAssign.length === 0}
              >
                Add Role
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Roles</p>
              {user.roles && user.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((userRole: any) => (
                      <div
                        key={userRole.id}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm group"
                    >
                        <span>{formatRoleLabel(userRole.role)}</span>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleRemoveRole(userRole.id)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove role"
                          >
                            ×
                          </button>
                        )}
                      </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No roles assigned</p>
            )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-semibold">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        size="md"
      >
        <UserForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsEditModalOpen(false);
          }}
          initialData={user}
        />
      </Modal>

      {/* Add Role Modal */}
      <Modal
        isOpen={isAddRoleModalOpen}
        onClose={() => {
          setIsAddRoleModalOpen(false);
          setSelectedRoleId('');
        }}
        title="Assign Role"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Select Role"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            options={[
              { value: '', label: 'Choose a role...' },
              ...availableRolesToAssign.map((role) => ({
                value: role.id.toString(),
                label: formatRoleLabel(role.name),
              })),
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddRoleModalOpen(false);
                setSelectedRoleId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedRoleId || isAssigningRole}
            >
              {isAssigningRole ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

