'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { classesApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { ClassForm } from '@/components/forms/class-form';
import { DataTable, type Column, type SortDirection, ExportButton } from '@/components/tables';

interface Class {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  description?: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const params = {
    page,
    limit,
    sort: sortKey,
    order: sortDirection === 'asc' ? 'asc' : sortDirection === 'desc' ? 'desc' : undefined,
  };

  const { data: classes, loading, error, meta, refetch } = usePaginatedApi(
    classesApi.getAll,
    params
  );

  const handleSort = (key: string, direction: SortDirection) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1);
  };

  const columns: Column<Class>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (cls) => (
        <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
          {cls.type}
        </span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      sortable: true,
      render: (cls) => cls.capacity || 'N/A',
    },
    {
      key: 'description',
      header: 'Description',
      render: (cls) => cls.description || '—',
    },
  ];

  if (error) {
    return <ErrorState message={error} retry={refetch} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Classes</h1>
          <p className="text-gray-600">Manage classes and platoons.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add Class</Button>
      </div>

      <DataTable
        data={classes || []}
        columns={columns}
        keyExtractor={(cls) => cls.id}
        pagination={meta}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(cls) => router.push(`/classes/${cls.id}`)}
        rowActions={(cls) => (
          <>
            <button
              onClick={() => router.push(`/classes/${cls.id}`)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
          </>
        )}
        selectable
        onSelectionChange={setSelectedIds}
        bulkActions={
          <ExportButton
            data={classes || []}
            columns={columns.map((col) => ({
              key: col.key,
              header: col.header,
              render: (cls) => {
                if (col.render) {
                  const rendered = col.render(cls);
                  return typeof rendered === 'string' ? rendered : String(rendered);
                }
                return String((cls as any)[col.key] || '');
              },
            }))}
            selectedIds={selectedIds}
            keyExtractor={(c) => c.id}
            filename="classes"
          />
        }
        loading={loading}
        emptyMessage="No classes found. Get started by creating a new class."
      />

      {/* Create Class Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Class"
        size="md"
      >
        <ClassForm
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
