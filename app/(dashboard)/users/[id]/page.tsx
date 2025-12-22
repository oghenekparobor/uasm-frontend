'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { UserForm } from '@/components/forms/user-form';

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: user, loading, error, refetch } = useApi(() =>
    usersApi.getOne(id)
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
            <CardTitle>Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.roles && user.roles.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-2">Roles</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role: any) => (
                    <span
                      key={role.id}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {role.role}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No roles assigned</p>
            )}
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
    </div>
  );
}

