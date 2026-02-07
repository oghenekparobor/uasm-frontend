'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { classesApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { ROLES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { ClassForm } from '@/components/forms/class-form';
import { DataTable, type Column, type SortDirection, ExportButton } from '@/components/tables';
import { FilterPanel, type FilterOption, PresetManager } from '@/components/filters';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Class {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  description?: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };

  const handleApplyPreset = (presetFilters: Record<string, any>) => {
    setFilters(presetFilters);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const params = {
    page,
    limit,
    search: search?.trim() || undefined,
    sortBy: sortKey,
    sortOrder: sortDirection === 'asc' ? 'asc' : sortDirection === 'desc' ? 'desc' : undefined,
    ...filters,
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

  const handleDeleteClass = async (cls: Class, e: React.MouseEvent) => {
    e.stopPropagation();
    const memberCount = (cls as any)._count?.members ?? 0;
    const message =
      memberCount > 0
        ? `Remove "${cls.name}"? This will permanently delete the class and all ${memberCount} member(s). This cannot be undone.`
        : `Remove "${cls.name}"? This cannot be undone.`;
    if (!confirm(message)) return;
    try {
      setDeletingId(cls.id);
      await classesApi.delete(cls.id);
      toast.success('Class and all its members removed successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove class');
    } finally {
      setDeletingId(null);
    }
  };

  const filterOptions: FilterOption[] = [
    {
      type: 'multi-select',
      key: 'types',
      label: 'Class Types',
      options: [
        { value: 'PLATOON', label: 'Platoon' },
        { value: 'CHILDREN', label: 'Children Class' },
      ],
    },
    {
      type: 'text',
      key: 'name',
      label: 'Class Name',
      placeholder: 'Filter by name...',
    },
  ];

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
      key: '_count',
      header: 'Members',
      sortable: false,
      render: (cls) => cls._count?.members || 0,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Classes</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isAdmin ? 'Manage classes and platoons.' : 'View your assigned classes.'}
          </p>
        </div>
        {isAdmin && (
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">Add Class</Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search classes..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Button type="submit" className="w-full sm:w-auto">Search</Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
          <PresetManager
            pageKey="classes"
            currentFilters={{ ...filters, search }}
            onApplyPreset={handleApplyPreset}
          />
        </div>
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
            {isSuperAdmin && (
              <button
                onClick={(e) => handleDeleteClass(cls, e)}
                disabled={deletingId === cls.id}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-700 transition-colors disabled:opacity-50"
              >
                {deletingId === cls.id ? 'Removing...' : 'Remove Class'}
              </button>
            )}
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
