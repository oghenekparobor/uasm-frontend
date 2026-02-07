'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { requestsApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { toast } from '@/hooks/use-toast';

export default function RequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: request, loading, error, refetch } = useApi(() =>
    requestsApi.getOne(id)
  );

  const handleApprove = async () => {
    try {
      await requestsApi.approve(id);
      toast.success('Request approved');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    try {
      await requestsApi.reject(id);
      toast.success('Request rejected');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
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

  if (!request) {
    return <ErrorState message="Request not found" />;
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
          <h1 className="text-4xl font-bold mb-2">Request - {request.type}</h1>
          <p className="text-gray-600">Request Details</p>
        </div>
        {request.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleApprove}>
              Approve
            </Button>
            <Button variant="outline" onClick={handleReject}>
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
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold">{request.type}</p>
            </div>
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

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
    </div>
  );
}

