'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { empowermentApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { ApproveEmpowermentForm } from '@/components/forms/empowerment-form';
import { toast } from '@/hooks/use-toast';

export default function EmpowermentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { data: request, loading, error, refetch } = useApi(() =>
    empowermentApi.getOne(id)
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

  if (!request) {
    return <ErrorState message="Empowerment request not found" />;
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
          <h1 className="text-4xl font-bold mb-2">Empowerment Request</h1>
          <p className="text-gray-600">Request Details</p>
        </div>
        {request.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(true)}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(true)}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Information */}
        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">
                <span
                  className={`px-2 py-1 rounded ${
                    request.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {request.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold">{request.type}</p>
            </div>
            {request.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-semibold">{request.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Request ID</p>
              <p className="font-mono text-sm">{request.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Member Information */}
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.member && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Member</p>
                  <p className="font-semibold">
                    {request.member.firstName} {request.member.lastName}
                  </p>
                </div>
                {request.member.currentClass && (
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-semibold">
                      {request.member.currentClass.name}
                    </p>
                  </div>
                )}
              </>
            )}
            {request.requester && (
              <div>
                <p className="text-sm text-gray-500">Requested By</p>
                <p className="font-semibold">
                  {request.requester.firstName} {request.requester.lastName}
                </p>
              </div>
            )}
            {request.approver && (
              <div>
                <p className="text-sm text-gray-500">Approved By</p>
                <p className="font-semibold">
                  {request.approver.firstName} {request.approver.lastName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            {request.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-semibold">
                  {new Date(request.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Empowerment Request"
        size="md"
      >
        <ApproveEmpowermentForm
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsApproveModalOpen(false);
          }}
          empowermentId={id}
          action="approve"
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Empowerment Request"
        size="md"
      >
        <ApproveEmpowermentForm
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsRejectModalOpen(false);
          }}
          empowermentId={id}
          action="reject"
        />
      </Modal>
    </div>
  );
}

