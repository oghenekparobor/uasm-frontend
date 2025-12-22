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
  onSuccess: () => void;
}

export function ConfirmReceiptForm({
  isOpen,
  onClose,
  onSuccess,
}: ConfirmReceiptFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConfirmReceiptInput>({
    resolver: zodResolver(confirmReceiptSchema),
    mode: 'onChange', // Real-time validation
  });

  const onSubmit = async (data: ConfirmReceiptInput) => {
    try {
      setLoading(true);
      await distributionApi.confirmReceipt(data);
      toast.success('Receipt confirmed successfully');
      onSuccess();
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
        options={[
          { value: '', label: 'Select attendance window' },
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
}

export function AllocateFoodForm({
  isOpen,
  onClose,
  onSuccess,
  batchId,
  classId,
}: AllocateFoodFormProps) {
  const [loading, setLoading] = useState(false);

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
    },
    mode: 'onChange', // Real-time validation
  });

  const onSubmit = async (data: AllocateFoodInput) => {
    try {
      setLoading(true);
      await distributionApi.allocateFood(batchId, classId, data);
      toast.success('Allocation created successfully');
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to allocate food');
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
          { value: 'PER_MEMBER', label: 'Per Member' },
          { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
        ]}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Allocating...' : 'Allocate'}
        </Button>
      </div>
    </form>
  );
}

