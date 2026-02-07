'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestsApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { RequestForm } from '@/components/forms/request-form';
import { DataTable, type Column, type SortDirection } from '@/components/tables';

interface Request {
  id: string;
  type: string;
  description?: string;
  status: string;
  createdAt: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const params = {
    page,
    limit,
    sort: sortKey,
    order: sortDirection === 'asc' ? 'asc' : sortDirection === 'desc' ? 'desc' : undefined,
  };

  const { data: requests, loading, error, meta, refetch } = usePaginatedApi<Request>(
    requestsApi.getAll,
    params
  );

  const handleSort = (key: string, direction: SortDirection) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1);
  };

  const handleApprove = async (requestId: string) => {
    try {
      await requestsApi.approve(requestId);
      refetch();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await requestsApi.reject(requestId);
      refetch();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const columns: Column<Request>[] = [
    {
      key: 'type',
      header: 'Type',
      sortable: true,
    },
    {
      key: 'description',
      header: 'Description',
      render: (request) => request.description || '—',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (request) => (
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
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (request) => new Date(request.createdAt).toLocaleDateString(),
    },
  ];

  if (error) {
    return <ErrorState message={error} retry={refetch} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Requests</h1>
          <p className="text-gray-600">View and manage requests.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Request
        </Button>
      </div>

      <DataTable
        data={requests || []}
        columns={columns}
        keyExtractor={(request) => request.id}
        pagination={meta}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(request) => router.push(`/requests/${request.id}`)}
        rowActions={(request) => (
          <>
            <button
              onClick={() => router.push(`/requests/${request.id}`)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
            {request.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleApprove(request.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-red-600"
                >
                  Reject
                </button>
              </>
            )}
          </>
        )}
        loading={loading}
        emptyMessage="No requests found. Get started by creating a new request."
      />

      {/* Create Request Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Request"
        size="md"
      >
        <RequestForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsCreateModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
