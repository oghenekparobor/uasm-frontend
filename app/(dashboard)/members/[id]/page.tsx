'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { membersApi, memberLogsApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { MemberForm } from '@/components/forms/member-form';

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: member, loading, error, refetch } = useApi(() =>
    membersApi.getOne(id)
  );
  const { data: history } = useApi(() => membersApi.getHistory(id));
  const { data: logs } = useApi(() => memberLogsApi.getByMember(id));

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

  if (!member) {
    return <ErrorState message="Member not found" />;
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
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-gray-600">Member Profile</p>
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
              <p className="font-semibold">{member.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-semibold">{member.lastName}</p>
            </div>
            {member.birthday && (
              <div>
                <p className="text-sm text-gray-500">Birthday</p>
                <p className="font-semibold">
                  {new Date(member.birthday).toLocaleDateString()}
                </p>
              </div>
            )}
            {member.currentClass && (
              <div>
                <p className="text-sm text-gray-500">Current Class</p>
                <p className="font-semibold">{member.currentClass.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Member ID</p>
              <p className="font-mono text-sm">{member.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold">
                {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-semibold">
                {new Date(member.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer History */}
      {history && history.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((transfer: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      {transfer.fromClass?.name || 'N/A'} →{' '}
                      {transfer.toClass?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transfer.transferredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member Logs */}
      {logs?.data && logs.data.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Member Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.data.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{log.type}</p>
                      {log.note && (
                        <p className="text-sm text-gray-500 mt-1">{log.note}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Member"
        size="lg"
      >
        <MemberForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsEditModalOpen(false);
          }}
          initialData={member}
        />
      </Modal>
    </div>
  );
}

