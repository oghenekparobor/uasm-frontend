'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { membersApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { MemberForm } from '@/components/forms/member-form';
import { DataTable, type Column, type SortDirection, ExportButton } from '@/components/tables';
import { FilterPanel, type FilterOption, PresetManager } from '@/components/filters';
import { formatDate } from '@/lib/utils/date';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  occupation?: string;
  status?: string;
  age?: number;
  gender?: string;
  currentClass?: {
    id: string;
    name: string;
  };
}

export default function MembersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
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

  // Transform filters to match backend API expectations
  const transformedFilters: Record<string, any> = {};
  
  // Handle birthday date range
  if (filters.birthday?.start || filters.birthday?.end) {
    if (filters.birthday.start) {
      transformedFilters.birthdayFrom = filters.birthday.start;
    }
    if (filters.birthday.end) {
      transformedFilters.birthdayTo = filters.birthday.end;
    }
  }

  // Handle class IDs (multi-select)
  if (filters.classIds && Array.isArray(filters.classIds) && filters.classIds.length > 0) {
    transformedFilters.currentClassIds = filters.classIds;
  }

  const params = {
    page,
    limit,
    search: search || undefined,
    sortBy: sortKey,
    sortOrder: sortDirection === 'asc' ? 'asc' : sortDirection === 'desc' ? 'desc' : undefined,
    ...transformedFilters,
  };

  const { data: members, loading, error, meta, refetch } =
    usePaginatedApi<Member>(membersApi.getAll, params);

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

  const handleImportCsv = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const { data } = await membersApi.uploadCsv(importFile);
      setImportResult(data);
      if (data.created > 0) refetch();
    } catch (err: any) {
      setImportResult({
        created: 0,
        errors: [{ row: 0, message: err?.response?.data?.message || err?.message || 'Upload failed.' }],
      });
    } finally {
      setImportLoading(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportResult(null);
    if (importFileInputRef.current) importFileInputRef.current.value = '';
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const columns: Column<Member>[] = [
    {
      key: 'photo',
      header: '',
      render: (member) => (
        <div className="flex items-center">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
              {getInitials(member.firstName, member.lastName)}
            </div>
          )}
        </div>
      ),
    },
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
      header: 'Date of Birth',
      render: (member) => (member.birthday ? formatDate(member.birthday) : '—'),
    },
    {
      key: 'age',
      header: 'Age',
      render: (member) => (member.age != null ? String(member.age) : '—'),
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (member) => member.gender || '—',
    },
    {
      key: 'occupation',
      header: 'Occupation',
      render: (member) => member.occupation || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) => member.status || '—',
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
    <div className="min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Members</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage and view all members.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              onClick={() => { setImportResult(null); setIsImportModalOpen(true); }}
              className="w-full sm:w-auto"
            >
              Import CSV
            </Button>
          )}
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">Add Member</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 sm:mb-6 space-y-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="flex-1 min-w-0 px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base sm:text-sm"
              />
              <Button type="submit" className="w-full sm:w-auto shrink-0">Search</Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
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
        onRowClick={(member) => router.push(`/dashboard/members/${member.id}`)}
        rowActions={(member) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/members/${member.id}`)}
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
              render: (member: Member) => {
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
            serverExport={{
              type: 'members',
              params: {
                ...transformedFilters,
                startDate: filters.birthday?.start,
                endDate: filters.birthday?.end,
              },
            }}
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

      {/* Import CSV Modal (admin/super_admin only) */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        title="Import members from CSV"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            CSV must include: First name, Last name, Gender, Date of Birth, Address, Phone Number, Platoon.
            Optional: Nearest Bus-stop (appended to address), Next of Kin (Name and Contact) → emergency contact.
          </p>
          <input
            ref={importFileInputRef}
            type="file"
            accept=".csv,text/csv,application/csv"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
          />
          {importResult != null && (
            <div className="rounded border p-3 text-sm">
              <p className="font-medium text-green-700">{importResult.created} member(s) created.</p>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-amber-700">Errors:</p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-amber-800">
                    {importResult.errors.map((e, i) => (
                      <li key={i}>Row {e.row}: {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeImportModal}>Close</Button>
            <Button
              type="button"
              onClick={handleImportCsv}
              disabled={!importFile || importLoading}
            >
              {importLoading ? 'Importing…' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
