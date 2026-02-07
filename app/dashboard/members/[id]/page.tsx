'use client';

import { useState, useRef } from 'react';
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
import { AttendanceStats } from '@/components/members/attendance-stats';
import { formatDate } from '@/lib/utils/date';
import { toast } from '@/hooks/use-toast';

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateLogModalOpen, setIsCreateLogModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const { data: empowermentRequests, loading: empowermentLoading } = usePaginatedApi<Record<string, unknown>>(
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      await membersApi.uploadPhoto(id, file);
      toast.success('Photo uploaded successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove this photo?')) return;

    try {
      setUploadingPhoto(true);
      await membersApi.removePhoto(id);
      toast.success('Photo removed successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600 border-2 border-gray-300">
                {getInitials(member.firstName, member.lastName)}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              title="Upload photo"
            >
              📷
            </Button>
          </div>
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

      {member.photoUrl && (
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={uploadingPhoto}
          >
            Remove Photo
          </Button>
        </div>
      )}

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
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-semibold">
                {member.birthday ? formatDate(member.birthday) : '—'}
              </p>
            </div>
            {member.age != null && (
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-semibold">{member.age}</p>
              </div>
            )}
            {member.gender && (
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-semibold">{member.gender}</p>
              </div>
            )}
            {member.occupation && (
              <div>
                <p className="text-sm text-gray-500">Occupation</p>
                <p className="font-semibold">{member.occupation}</p>
              </div>
            )}
            {member.status && (
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{member.status}</p>
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-semibold">
                {member.phone ? (
                  <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                    {member.phone}
                  </a>
                ) : (
                  '—'
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">
                {member.email ? (
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                    {member.email}
                  </a>
                ) : (
                  '—'
                )}
              </p>
            </div>
            {member.address && (
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold whitespace-pre-line">{member.address}</p>
              </div>
            )}
            {member.emergencyContact && (
              <div>
                <p className="text-sm text-gray-500">Emergency Contact</p>
                <p className="font-semibold whitespace-pre-line">{member.emergencyContact}</p>
              </div>
            )}
            {!member.phone && !member.email && !member.address && !member.emergencyContact ? (
              <p className="text-sm text-gray-400">No contact information available</p>
            ) : null}
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
                {formatDate(member.createdAt)}
              </p>
            </div>
            {member.updatedAt && (
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-semibold">
                  {formatDate(member.updatedAt)}
              </p>
            </div>
            )}
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

      {/* Attendance */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
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
            <div className="space-y-6">
              {/* Statistics */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Statistics</h3>
                <AttendanceStats records={attendanceHistory || []} />
              </div>

              {/* Heatmap */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Visual Overview</h3>
                <AttendanceHeatmap records={attendanceHistory || []} />
              </div>

              {/* Detailed History */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Attendance History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Class
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Marked By
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Marked At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((record: any) => (
                        <tr
                          key={record.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm">
                            {formatDate(record.attendanceWindow?.sundayDate || record.markedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.status === 'present' ? 'Present' : 'Absent'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.class?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.user
                              ? `${record.user.firstName} ${record.user.lastName}`
                              : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(record.markedAt, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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

