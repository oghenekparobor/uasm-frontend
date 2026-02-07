'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { distributionApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { AllocateFoodForm } from '@/components/forms/distribution-form';

// Synthetic Workers class (excluded from classes and distribution)
const WORKERS_CLASS_ID = '00000000-0000-0000-0000-00000000WORK';

export default function DistributionBatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [allocationModalOpen, setAllocationModalOpen] = useState<string | null>(null);
  
  const { data: batch, loading, error, refetch } = useApi(() =>
    distributionApi.getBatch(id)
  );
  const { data: classesWithAttendance, loading: loadingClasses, refetch: refetchClasses } = useApi(() =>
    distributionApi.getClassesWithAttendance(id)
  );
  const { data: allocations, refetch: refetchAllocations } = useApi(() =>
    distributionApi.getAllocations({ batchId: id })
  );

  const isAttendanceWindowOpen = useMemo(() => {
    if (!batch?.attendanceWindow) return false;
    const win = batch.attendanceWindow;
    if (!win?.opensAt || !win?.closesAt) return false;
    const now = new Date();
    const opensAt = new Date(win.opensAt);
    const closesAt = new Date(win.closesAt);
    return now >= opensAt && now <= closesAt;
  }, [batch?.attendanceWindow]);

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
          ) : !classesWithAttendance || !classesWithAttendance.classes || classesWithAttendance.classes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No classes available</p>
          ) : (
            <>
              {!isAttendanceWindowOpen && (
                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-sm">
                  Allocation is disabled because the attendance window for this batch is closed.
                </p>
              )}
            <div className="space-y-4">
              {(classesWithAttendance.classes as any[])
                .filter((cls: any) => !cls.isWorkers && cls.id !== WORKERS_CLASS_ID)
                .map((cls: any) => {
                const existingAllocation = allocations?.data?.find(
                  (a: any) => a.classId === cls.id
                ) || cls.allocation;
                
                return (
                  <div
                    key={cls.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{cls.name}</p>
                        <p className="text-sm text-gray-500">
                          Type: {cls.type} | Members: {cls.memberCount || 0}
                        </p>
                        
                        {/* Attendance Report */}
                        {cls.attendance && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium text-gray-700 mb-1">Attendance Report:</p>
                            <div className="flex gap-4 text-xs">
                              <span className="text-green-600">
                                ✓ Present: {cls.attendance.present || 0}
                              </span>
                              <span className="text-red-600">
                                ✗ Absent: {cls.attendance.absent || 0}
                              </span>
                              <span className="text-gray-600">
                                ⊘ Unmarked: {cls.attendance.unmarked || 0}
                              </span>
                            </div>
                            {(cls.attendance.marked || 0) === 0 && cls.attendance.totalMembers > 0 && (
                              <p className="text-xs text-orange-600 mt-1">
                                Attendance not yet taken for this window
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Allocation Status */}
                        {existingAllocation && (
                          <p className="text-sm text-green-600 mt-2">
                            Already allocated: Food {existingAllocation.foodAllocated} | Water{' '}
                            {existingAllocation.waterAllocated}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => setAllocationModalOpen(cls.id)}
                        variant={existingAllocation ? 'outline' : 'default'}
                        disabled={!isAttendanceWindowOpen}
                        title={!isAttendanceWindowOpen ? 'Attendance window is closed' : undefined}
                      >
                        {existingAllocation ? 'Update Allocation' : 'Allocate'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Existing Allocations */}
      {allocations?.data && allocations.data.filter((a: any) => a.classId !== WORKERS_CLASS_ID).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allocations.data
                .filter((allocation: any) => allocation.classId !== WORKERS_CLASS_ID)
                .map((allocation: any) => (
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
                    disabled={!isAttendanceWindowOpen}
                    title={!isAttendanceWindowOpen ? 'Attendance window is closed' : undefined}
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
              refetchClasses();
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

