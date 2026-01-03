'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { distributionApi, classesApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { AllocateFoodForm } from '@/components/forms/distribution-form';
import { toast } from '@/hooks/use-toast';

export default function DistributionBatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState<string | null>(null);
  
  const { data: batch, loading, error, refetch } = useApi(() =>
    distributionApi.getBatch(id)
  );
  const { data: allocations, refetch: refetchAllocations } = useApi(() =>
    distributionApi.getAllocations({ batchId: id })
  );

  // Fetch all classes for allocation
  useEffect(() => {
    if (batch) {
      setLoadingClasses(true);
      classesApi
        .getAll({ limit: 100 })
        .then((response) => {
          setClasses(response.data.data || []);
        })
        .catch((error) => {
          console.error('Failed to fetch classes:', error);
        })
        .finally(() => {
          setLoadingClasses(false);
        });
    }
  }, [batch]);

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
            Distribution Batch -{' '}
            {batch.attendanceWindow?.sundayDate
              ? new Date(batch.attendanceWindow.sundayDate).toLocaleDateString()
              : 'N/A'}
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
                {batch.attendanceWindow?.sundayDate
                  ? new Date(batch.attendanceWindow.sundayDate).toLocaleDateString()
                  : 'N/A'}
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
            {(() => {
              const allocatedFood = allocations?.data?.reduce(
                (sum: number, a: any) => sum + (a.foodAllocated || 0),
                0
              ) || 0;
              const allocatedWater = allocations?.data?.reduce(
                (sum: number, a: any) => sum + (a.waterAllocated || 0),
                0
              ) || 0;
              const remainingFood = batch.totalFoodReceived - allocatedFood;
              const remainingWater = batch.totalWaterReceived - allocatedWater;

              return (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Food Allocated</p>
                    <p className="text-xl font-bold text-green-600">
                      {allocatedFood} / {batch.totalFoodReceived}
                    </p>
                    <p className="text-xs text-gray-400">
                      Remaining: {remainingFood}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Water Allocated</p>
                    <p className="text-xl font-bold text-blue-600">
                      {allocatedWater} / {batch.totalWaterReceived}
                    </p>
                    <p className="text-xs text-gray-400">
                      Remaining: {remainingWater}
              </p>
            </div>
            <div>
                    <p className="text-sm text-gray-500">Confirmed At</p>
              <p className="font-semibold">
                      {batch.confirmedAt
                        ? new Date(batch.confirmedAt).toLocaleDateString()
                        : batch.createdAt
                        ? new Date(batch.createdAt).toLocaleDateString()
                        : 'N/A'}
              </p>
            </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Allocate to Classes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Allocate to Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingClasses ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : classes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No classes available</p>
          ) : (
            <div className="space-y-4">
              {classes.map((cls: any) => {
                const existingAllocation = allocations?.data?.find(
                  (a: any) => a.classId === cls.id
                );
                
                return (
                  <div
                    key={cls.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">{cls.name}</p>
                        <p className="text-sm text-gray-500">
                          Type: {cls.type} | Members: {cls._count?.members || 0}
                        </p>
                        {existingAllocation && (
                          <p className="text-sm text-green-600 mt-1">
                            Already allocated: Food {existingAllocation.foodAllocated} | Water{' '}
                            {existingAllocation.waterAllocated}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => setAllocationModalOpen(cls.id)}
                        variant={existingAllocation ? 'outline' : 'default'}
                      >
                        {existingAllocation ? 'Update Allocation' : 'Allocate'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Allocations */}
      {allocations?.data && allocations.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allocations.data.map((allocation: any) => (
                <div
                  key={allocation.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">{allocation.class?.name}</p>
                    <p className="text-sm text-gray-500">
                      Food: {allocation.foodAllocated} | Water:{' '}
                      {allocation.waterAllocated}
                    </p>
                    <p className="text-xs text-gray-400">
                      Type: {allocation.allocationType}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setAllocationModalOpen(allocation.classId)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Allocation Modal */}
      {allocationModalOpen && (
        <Modal
          isOpen={!!allocationModalOpen}
          onClose={() => setAllocationModalOpen(null)}
          title="Allocate Food & Water"
          size="md"
        >
          <AllocateFoodForm
            isOpen={!!allocationModalOpen}
            onClose={() => setAllocationModalOpen(null)}
            onSuccess={() => {
              refetchAllocations();
              setAllocationModalOpen(null);
            }}
            batchId={id}
            classId={allocationModalOpen}
            initialData={
              allocations?.data?.find((a: any) => a.classId === allocationModalOpen) || null
            }
          />
        </Modal>
      )}
    </div>
  );
}

