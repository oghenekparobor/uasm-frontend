'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { empowermentApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import {
  CreateEmpowermentForm,
  ApproveEmpowermentForm,
} from '@/components/forms/empowerment-form';
import { DataTable, type Column, type SortDirection, ExportButton } from '@/components/tables';

interface EmpowermentRequest {
  id: string;
  type: string;
  description?: string;
  status: string;
  member?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function EmpowermentPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const params = {
    page,
    limit,
    sort: sortKey,
    order: sortDirection === 'asc' ? 'asc' : sortDirection === 'desc' ? 'desc' : undefined,
  };

  const { data: requests, loading, error, meta, refetch } = usePaginatedApi(
    empowermentApi.getAll,
    params
  );

  const handleSort = (key: string, direction: SortDirection) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1);
  };

  const columns: Column<EmpowermentRequest>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (request) =>
        request.member
          ? `${request.member.firstName} ${request.member.lastName}`
          : 'N/A',
    },
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
          <h1 className="text-4xl font-bold mb-2">Empowerment</h1>
          <p className="text-gray-600">Manage empowerment requests.</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={[]}
            columns={[]}
            filename="empowerment-requests"
            serverExport={{
              type: 'empowerment-requests',
            }}
          />
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Request
          </Button>
        </div>
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
        onRowClick={(request) => router.push(`/empowerment/${request.id}`)}
        rowActions={(request) => (
          <>
            <button
              onClick={() => router.push(`/empowerment/${request.id}`)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
            {request.status === 'PENDING' && (
              <>
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsApproveModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsRejectModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-red-600"
                >
                  Reject
                </button>
              </>
            )}
          </>
        )}
        loading={loading}
        emptyMessage="No empowerment requests found. Get started by creating a new request."
      />

      {/* Create Request Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Empowerment Request"
        size="lg"
      >
        <CreateEmpowermentForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsCreateModalOpen(false);
          }}
        />
      </Modal>

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
            setSelectedRequest(null);
          }}
          empowermentId={selectedRequest?.id || ''}
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
            setSelectedRequest(null);
          }}
          empowermentId={selectedRequest?.id || ''}
          action="reject"
        />
      </Modal>
    </div>
  );
}
