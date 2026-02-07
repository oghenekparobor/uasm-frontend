'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { EventForm } from '@/components/forms/event-form';
import { DataTable, type Column, type SortDirection } from '@/components/tables';

interface Event {
  id: string;
  title: string;
  description?: string;
  status: string;
  eventDate?: string;
  scope?: string;
  createdAt: string;
}

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
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

  const { data: events, loading, error, meta, refetch } = usePaginatedApi<Event>(
    eventsApi.getAll,
    params
  );

  const handleSort = (key: string, direction: SortDirection) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
    setPage(1);
  };

  const handleApprove = async (eventId: string) => {
    try {
      await eventsApi.approve(eventId);
      refetch();
    } catch (error) {
      console.error('Failed to approve event:', error);
    }
  };

  const columns: Column<Event>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
    },
    {
      key: 'description',
      header: 'Description',
      render: (event) => event.description || '—',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (event) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            event.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {event.status}
        </span>
      ),
    },
    {
      key: 'eventDate',
      header: 'Event Date',
      sortable: true,
      render: (event) =>
        event.eventDate ? new Date(event.eventDate).toLocaleString() : '—',
    },
    {
      key: 'scope',
      header: 'Scope',
      render: (event) => {
        if (event.scope === 'GLOBAL') return 'Global (All Classes)';
        if (event.scope === 'CLASS') return 'Class Specific';
        return event.scope || '—';
      },
    },
  ];

  if (error) {
    return <ErrorState message={error} retry={refetch} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Events</h1>
          <p className="text-gray-600">View upcoming events and activities.</p>
        </div>
        {isAdmin && (
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Event
        </Button>
        )}
      </div>

      <DataTable
        data={events || []}
        columns={columns}
        keyExtractor={(event) => event.id}
        pagination={meta}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(event) => router.push(`/dashboard/events/${event.id}`)}
        rowActions={(event) => (
          <>
            <button
              onClick={() => router.push(`/dashboard/events/${event.id}`)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
            {isAdmin && event.status === 'PENDING' && (
              <button
                onClick={() => handleApprove(event.id)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
              >
                Approve
              </button>
            )}
          </>
        )}
        loading={loading}
        emptyMessage="No events found. Get started by creating a new event."
      />

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Event"
        size="lg"
      >
        <EventForm
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
