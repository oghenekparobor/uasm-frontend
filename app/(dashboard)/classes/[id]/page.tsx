'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { classesApi, membersApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { ClassForm } from '@/components/forms/class-form';

export default function ClassDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: classData, loading, error, refetch } = useApi(() =>
    classesApi.getOne(id)
  );
  const { data: members } = useApi(() =>
    membersApi.getAll({ currentClassId: id })
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
            {classData.capacity && (
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-semibold">{classData.capacity}</p>
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
            <CardTitle>Leaders & Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            {classData.leaders && classData.leaders.length > 0 ? (
              <div className="space-y-2">
                {classData.leaders.map((leader: any) => (
                  <div key={leader.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {leader.user?.firstName} {leader.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{leader.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No leaders assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members?.data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {members?.data && members.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.data.map((member: any) => (
                <div
                  key={member.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => (window.location.href = `/members/${member.id}`)}
                >
                  <p className="font-semibold">
                    {member.firstName} {member.lastName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No members in this class</p>
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
    </div>
  );
}

