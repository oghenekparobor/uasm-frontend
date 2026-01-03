'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  confirmReceiptSchema,
  allocateFoodSchema,
  type ConfirmReceiptInput,
  type AllocateFoodInput,
} from '@/lib/validations/distribution.schema';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { distributionApi, attendanceApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface ConfirmReceiptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (batchId?: string) => void;
}

export function ConfirmReceiptForm({
  isOpen,
  onClose,
  onSuccess,
}: ConfirmReceiptFormProps) {
  const [loading, setLoading] = useState(false);
  const [windows, setWindows] = useState<any[]>([]);
  const [loadingWindows, setLoadingWindows] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConfirmReceiptInput>({
    resolver: zodResolver(confirmReceiptSchema),
    mode: 'onChange', // Real-time validation
  });

  // Fetch attendance windows when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingWindows(true);
      attendanceApi
        .getWindows()
        .then((response) => {
          setWindows(response.data || []);
        })
        .catch((error) => {
          console.error('Failed to fetch attendance windows:', error);
          toast.error('Failed to load attendance windows');
        })
        .finally(() => {
          setLoadingWindows(false);
        });
    }
  }, [isOpen]);

  const onSubmit = async (data: ConfirmReceiptInput) => {
    try {
      setLoading(true);
      const response = await distributionApi.confirmReceipt(data);
      toast.success('Receipt confirmed successfully');
      const batchId = response.data?.id;
      onSuccess(batchId);
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Attendance Window"
        {...register('attendanceWindowId')}
        error={errors.attendanceWindowId?.message}
        disabled={loadingWindows}
        options={[
          { value: '', label: loadingWindows ? 'Loading windows...' : 'Select attendance window' },
          ...windows.map((window) => ({
            value: window.id,
            label: `${new Date(window.sundayDate).toLocaleDateString()} ${
              window.isOpen ? '(Open)' : '(Closed)'
            }`,
          })),
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Total Food Received"
          type="number"
          {...register('totalFoodReceived', { valueAsNumber: true })}
          error={errors.totalFoodReceived?.message}
        />
        <Input
          label="Total Water Received"
          type="number"
          {...register('totalWaterReceived', { valueAsNumber: true })}
          error={errors.totalWaterReceived?.message}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Confirming...' : 'Confirm Receipt'}
        </Button>
      </div>
    </form>
  );
}

interface AllocateFoodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
  classId: string;
  initialData?: any;
}

export function AllocateFoodForm({
  isOpen,
  onClose,
  onSuccess,
  batchId,
  classId,
  initialData,
}: AllocateFoodFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AllocateFoodInput>({
    resolver: zodResolver(allocateFoodSchema),
    defaultValues: {
      distributionBatchId: batchId,
      classId,
      foodAllocated: initialData?.foodAllocated || 0,
      waterAllocated: initialData?.waterAllocated || 0,
      allocationType: initialData?.allocationType || 'DEFAULT',
    },
    mode: 'onChange', // Real-time validation
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setValue('foodAllocated', initialData.foodAllocated || 0);
      setValue('waterAllocated', initialData.waterAllocated || 0);
      setValue('allocationType', initialData.allocationType || 'PER_MEMBER');
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: AllocateFoodInput) => {
    try {
      setLoading(true);
      const allocationData = {
        foodAllocated: data.foodAllocated,
        waterAllocated: data.waterAllocated,
        allocationType: data.allocationType,
      };
      
      if (isEditing && initialData?.id) {
        // Update existing allocation
        await distributionApi.updateAllocation(initialData.id, allocationData);
        toast.success('Allocation updated successfully');
      } else {
        // Create new allocation
        await distributionApi.allocateFood(batchId, classId, allocationData);
      toast.success('Allocation created successfully');
      }
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} allocation`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Food Allocated"
          type="number"
          {...register('foodAllocated', { valueAsNumber: true })}
          error={errors.foodAllocated?.message}
        />
        <Input
          label="Water Allocated"
          type="number"
          {...register('waterAllocated', { valueAsNumber: true })}
          error={errors.waterAllocated?.message}
        />
      </div>

      <Select
        label="Allocation Type"
        {...register('allocationType')}
        error={errors.allocationType?.message}
        options={[
          { value: '', label: 'Select type' },
          { value: 'DEFAULT', label: 'Default Allocation' },
          { value: 'EXTRA', label: 'Extra Allocation' },
        ]}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (isEditing ? 'Updating...' : 'Allocating...') : (isEditing ? 'Update Allocation' : 'Allocate')}
        </Button>
      </div>
    </form>
  );
}

