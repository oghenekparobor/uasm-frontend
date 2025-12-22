'use client';

import { useRouter, useParams } from 'next/navigation';
import { eventsApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: event, loading, error, refetch } = useApi(() =>
    eventsApi.getOne(id)
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

  if (!event) {
    return <ErrorState message="Event not found" />;
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
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-600">Event Details</p>
        </div>
        {event.status === 'PENDING' && (
          <Button variant="outline">Approve</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-semibold">{event.title}</p>
            </div>
            {event.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-semibold">{event.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">
                <span
                  className={`px-2 py-1 rounded ${
                    event.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {event.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Scope</p>
              <p className="font-semibold">{event.scope}</p>
            </div>
            {event.class && (
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-semibold">{event.class.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.eventDate && (
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="font-semibold">
                  {new Date(event.eventDate).toLocaleString()}
                </p>
              </div>
            )}
            {event.location && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{event.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Recurring</p>
              <p className="font-semibold">
                {event.isRecurring ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Event ID</p>
              <p className="font-mono text-sm">{event.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

