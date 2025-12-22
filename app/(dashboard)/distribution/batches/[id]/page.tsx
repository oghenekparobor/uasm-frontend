'use client';

import { useRouter, useParams } from 'next/navigation';
import { distributionApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

export default function DistributionBatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: batch, loading, error, refetch } = useApi(() =>
    distributionApi.getBatch(id)
  );
  const { data: allocations } = useApi(() =>
    distributionApi.getAllocations({ batchId: id })
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

  if (!batch) {
    return <ErrorState message="Distribution batch not found" />;
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
          <h1 className="text-4xl font-bold mb-2">
            Distribution Batch - {new Date(batch.sundayDate).toLocaleDateString()}
          </h1>
          <p className="text-gray-600">Distribution Batch Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Batch Information */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Sunday Date</p>
              <p className="font-semibold">
                {new Date(batch.sundayDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Food Received</p>
              <p className="text-2xl font-bold">{batch.totalFoodReceived}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Water Received</p>
              <p className="text-2xl font-bold">{batch.totalWaterReceived}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Batch ID</p>
              <p className="font-mono text-sm">{batch.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Allocations</p>
              <p className="text-2xl font-bold">
                {allocations?.data?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold">
                {new Date(batch.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocations */}
      {allocations?.data && allocations.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allocations.data.map((allocation: any) => (
                <div
                  key={allocation.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{allocation.class?.name}</p>
                    <p className="text-sm text-gray-500">
                      Food: {allocation.foodAllocated} | Water:{' '}
                      {allocation.waterAllocated}
                    </p>
                  </div>
                  <Button variant="outline">Edit</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

