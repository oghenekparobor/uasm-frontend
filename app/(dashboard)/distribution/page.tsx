'use client';

import { useState } from 'react';
import { distributionApi } from '@/lib/api-services';
import { useApi, usePaginatedApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { ConfirmReceiptForm } from '@/components/forms/distribution-form';

export default function DistributionPage() {
  const [isConfirmReceiptModalOpen, setIsConfirmReceiptModalOpen] =
    useState(false);
  const { data: currentBatch, loading: batchLoading, refetch: refetchBatch } =
    useApi(distributionApi.getCurrentBatch);
  const { data: batches, loading: batchesLoading, error, refetch } =
    usePaginatedApi(distributionApi.getBatches, { page: 1, limit: 10 });

  const loading = batchLoading || batchesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Distribution</h1>
          <p className="text-gray-600">
            Manage food and water distribution.
          </p>
        </div>
        <Button onClick={() => setIsConfirmReceiptModalOpen(true)}>
          Confirm Receipt
        </Button>
      </div>

      {/* Current Batch */}
      {currentBatch && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Food Received</p>
                <p className="text-2xl font-bold">
                  {currentBatch.totalFoodReceived}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Water Received</p>
                <p className="text-2xl font-bold">
                  {currentBatch.totalWaterReceived}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-lg font-semibold">
                  {new Date(currentBatch.sundayDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Button variant="outline" className="w-full">
                  View Allocations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batches History */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
        </CardHeader>
        <CardContent>
          {!batches || batches.length === 0 ? (
            <p className="text-gray-500">No distribution batches found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Sunday Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Food Received
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Water Received
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Created At
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batches.map((batch: any) => (
                    <tr
                      key={batch.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {new Date(batch.sundayDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{batch.totalFoodReceived}</td>
                      <td className="px-4 py-3 text-sm">{batch.totalWaterReceived}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/distribution/batches/${batch.id}`)
                          }
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Receipt Modal */}
      <Modal
        isOpen={isConfirmReceiptModalOpen}
        onClose={() => setIsConfirmReceiptModalOpen(false)}
        title="Confirm Receipt"
        size="md"
      >
        <ConfirmReceiptForm
          isOpen={isConfirmReceiptModalOpen}
          onClose={() => setIsConfirmReceiptModalOpen(false)}
          onSuccess={() => {
            refetch();
            refetchBatch();
            setIsConfirmReceiptModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
