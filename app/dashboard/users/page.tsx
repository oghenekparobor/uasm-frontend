'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { UserForm } from '@/components/forms/user-form';
import { DataTable, type Column, type SortDirection, ExportButton } from '@/components/tables';
import { FilterPanel, type FilterOption, PresetManager } from '@/components/filters';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles?: Array<{ role: string }>;
}

export default function UsersPage() {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

  const { data: users, loading, error, meta, refetch } = usePaginatedApi<User>(
    usersApi.getAll,
    params
  );

  const handleSort = (key: string, direction: SortDirection) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1);
  };

  const filterOptions: FilterOption[] = [
    {
      type: 'multi-select',
      key: 'roles',
      label: 'Roles',
      options: [
        { value: 'worker', label: 'Worker' },
        { value: 'platoon_leader', label: 'Platoon Leader' },
        { value: 'assistant_platoon_leader', label: 'Assistant Platoon Leader' },
        { value: 'children_teacher', label: 'Children Teacher' },
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'distribution', label: 'Distribution' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' },
      ],
    },
    {
      type: 'select',
      key: 'isActive',
      label: 'Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const columns: Column<User>[] = [
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
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (user) => user.phone || '—',
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user) =>
        user.roles && user.roles.length > 0
          ? user.roles.map((r: any) => (
              <span
                key={r.role}
                className="inline-block px-2 py-1 mr-1 mb-1 rounded bg-gray-100 text-gray-800 text-xs"
              >
                {r.role}
              </span>
            ))
          : 'No roles',
    },
  ];

  if (error) {
    return <ErrorState message={error} retry={refetch} />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Users</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage workers and their roles.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">Add User</Button>
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
                placeholder="Search users by name or email..."
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
            pageKey="users"
            currentFilters={{ ...filters, search }}
            onApplyPreset={handleApplyPreset}
          />
        </div>
      </div>

      <DataTable
        data={users || []}
        columns={columns}
        keyExtractor={(user) => user.id}
        pagination={meta}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(user) => router.push(`/dashboard/users/${user.id}`)}
        rowActions={(user) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/users/${user.id}`)}
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
            data={users || []}
            columns={columns.map((col) => ({
              key: col.key,
              header: col.header,
              render: (user: User) => {
                if (col.render) {
                  const rendered = col.render(user);
                  if (typeof rendered === 'string') return rendered;
                  // Handle React nodes (like role badges)
                  if (col.key === 'roles') {
                    return user.roles?.map((r: any) => r.role).join(', ') || 'No roles';
                  }
                  return String(rendered);
                }
                return String((user as any)[col.key] || '');
              },
            }))}
            selectedIds={selectedIds}
            keyExtractor={(u) => u.id}
            filename="users"
          />
        }
        loading={loading}
        emptyMessage="No users found. Get started by adding a new user."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add User"
        size="md"
      >
        <UserForm
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
