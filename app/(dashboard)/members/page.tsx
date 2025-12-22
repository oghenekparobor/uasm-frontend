'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { membersApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { MemberForm } from '@/components/forms/member-form';
import { DataTable, type Column, type SortDirection, ExportButton } from '@/components/tables';
import { FilterPanel, type FilterOption, PresetManager } from '@/components/filters';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  currentClass?: {
    id: string;
    name: string;
  };
}

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

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

  const params = {
    page,
    limit,
    search: search || undefined,
    sort: sortKey,
    order: sortDirection === 'asc' ? 'asc' : sortDirection === 'desc' ? 'desc' : undefined,
    ...filters,
  };

  const { data: members, loading, error, meta, refetch } =
    usePaginatedApi(membersApi.getAll, params);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleSort = (key: string, direction: SortDirection) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1);
  };

  const filterOptions: FilterOption[] = [
    {
      type: 'date-range',
      key: 'birthday',
      label: 'Birthday Range',
    },
    {
      type: 'multi-select',
      key: 'classIds',
      label: 'Classes',
      options: [], // Will be populated from API if needed
    },
  ];

  const columns: Column<Member>[] = [
    {
      key: 'firstName',
      header: 'First Name',
      sortable: true,
    },
    {
      key: 'lastName',
      header: 'Last Name',
      sortable: true,
    },
    {
      key: 'birthday',
      header: 'Birthday',
      render: (member) =>
        member.birthday
          ? new Date(member.birthday).toLocaleDateString()
          : 'N/A',
    },
    {
      key: 'currentClass',
      header: 'Class',
      render: (member) => member.currentClass?.name || 'No Class',
    },
  ];

  if (error) {
    return <ErrorState message={error} retry={refetch} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Members</h1>
          <p className="text-gray-600">Manage and view all members.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add Member</Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
          <PresetManager
            pageKey="members"
            currentFilters={{ ...filters, search }}
            onApplyPreset={handleApplyPreset}
          />
        </div>
      </div>

      {/* Members Table */}
      <DataTable
        data={members || []}
        columns={columns}
        keyExtractor={(member) => member.id}
        pagination={meta}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(member) => router.push(`/members/${member.id}`)}
        rowActions={(member) => (
          <>
            <button
              onClick={() => router.push(`/members/${member.id}`)}
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
            data={members || []}
            columns={columns.map((col) => ({
              key: col.key,
              header: col.header,
              render: (member) => {
                if (col.render) {
                  const rendered = col.render(member);
                  return typeof rendered === 'string' ? rendered : String(rendered);
                }
                return String((member as any)[col.key] || '');
              },
            }))}
            selectedIds={selectedIds}
            keyExtractor={(m) => m.id}
            filename="members"
          />
        }
        loading={loading}
        emptyMessage="No members found. Get started by adding a new member."
      />

      {/* Create Member Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Member"
        size="lg"
      >
        <MemberForm
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
