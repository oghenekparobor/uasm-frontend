'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { membersApi, memberLogsApi, attendanceApi, empowermentApi } from '@/lib/api-services';
import { useApi, usePaginatedApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { MemberForm } from '@/components/forms/member-form';
import { CreateMemberLogForm } from '@/components/forms/member-log-form';
import { AttendanceHeatmap } from '@/components/attendance/attendance-heatmap';

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateLogModalOpen, setIsCreateLogModalOpen] = useState(false);
  const { data: member, loading, error, refetch } = useApi(() =>
    membersApi.getOne(id)
  );
  const { data: history } = useApi(() => membersApi.getHistory(id));
  const { data: logs, refetch: refetchLogs } = useApi(() => memberLogsApi.getByMember(id));
  // Fetch attendance records for the heatmap (using max allowed limit)
  const { data: attendanceHistory, loading: attendanceLoading } = usePaginatedApi<any>(
    (params) => attendanceApi.getMemberAttendanceHistory(id, params),
    { page: 1, limit: 100, sortBy: 'markedAt', sortOrder: 'desc' }
  );
  // Fetch empowerment requests for this member
  const { data: empowermentRequests, loading: empowermentLoading } = usePaginatedApi(
    (params) => empowermentApi.getAll({ ...params, memberId: id }),
    { page: 1, limit: 100 }
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

  if (!member) {
    return <ErrorState message="Member not found" />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Member Profile</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsCreateLogModalOpen(true)} className="w-full sm:w-auto">
            Create Log
          </Button>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="w-full sm:w-auto">
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

      {/* Attendance Logs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : !attendanceHistory || attendanceHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No attendance records found for this member.
            </p>
          ) : (
            <AttendanceHeatmap records={attendanceHistory || []} />
          )}
        </CardContent>
      </Card>

      {/* Empowerment Requests */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Empowerment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {empowermentLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : !empowermentRequests || empowermentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No empowerment requests found for this member.
            </p>
          ) : (
            <div className="space-y-4">
              {empowermentRequests.map((request: any) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/empowerment/${request.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">{request.type}</p>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            request.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      {request.description && (
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>
                          Requested: {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        {request.requester && (
                          <span>
                            by {request.requester.firstName} {request.requester.lastName}
                          </span>
                        )}
                        {request.approvedAt && (
                          <span>
                            Approved: {new Date(request.approvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Logs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Member Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs?.data || logs.data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No logs found for this member.
            </p>
          ) : (
            <div className="space-y-4">
              {logs.data.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {log.note && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.note}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        {log.user && (
                          <span>
                            by {log.user.firstName} {log.user.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Log Modal */}
      <Modal
        isOpen={isCreateLogModalOpen}
        onClose={() => setIsCreateLogModalOpen(false)}
        title="Create Member Log"
        size="md"
      >
        <CreateMemberLogForm
          isOpen={isCreateLogModalOpen}
          onClose={() => setIsCreateLogModalOpen(false)}
          onSuccess={() => {
            refetchLogs();
            setIsCreateLogModalOpen(false);
          }}
          memberId={id}
        />
      </Modal>

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

