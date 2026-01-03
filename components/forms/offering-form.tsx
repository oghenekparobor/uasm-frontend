'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createOfferingSchema,
  updateOfferingSchema,
  type CreateOfferingInput,
  type UpdateOfferingInput,
} from '@/lib/validations/offering.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { offeringsApi, attendanceApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface OfferingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId: string;
  attendanceWindowId?: string;
  initialData?: CreateOfferingInput & { id: string };
}

export function OfferingForm({
  isOpen,
  onClose,
  onSuccess,
  classId,
  attendanceWindowId,
  initialData,
}: OfferingFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateOfferingSchema : createOfferingSchema;
  const [loading, setLoading] = useState(false);
  const [windows, setWindows] = useState<any[]>([]);
  const [loadingWindows, setLoadingWindows] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateOfferingInput | UpdateOfferingInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      classId: classId || '',
      attendanceWindowId: attendanceWindowId || '',
      offeringAmount: initialData?.offeringAmount || 0,
      titheAmount: initialData?.titheAmount || 0,
      notes: initialData?.notes || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen && !isEditing) {
      // Fetch attendance windows when modal opens (for new offering)
      const fetchWindows = async () => {
        try {
          setLoadingWindows(true);
          const response = await attendanceApi.getWindows();
          // Backend returns array directly, so response.data is the array
          // Backend already sorts by sundayDate desc, we just need to limit to 5
          const windowsData = Array.isArray(response.data) ? response.data : [];
          // Limit to 5 most recent (backend already sorted by sundayDate desc)
          const recentWindows = windowsData.slice(0, 5);
          setWindows(recentWindows);
        } catch (error) {
          console.error('Failed to fetch attendance windows:', error);
          toast.error('Failed to load attendance windows');
          setWindows([]);
        } finally {
          setLoadingWindows(false);
        }
      };
      fetchWindows();
    }
  }, [isOpen, isEditing]);

  useEffect(() => {
    if (initialData) {
      setValue('offeringAmount', initialData.offeringAmount || 0);
      setValue('titheAmount', initialData.titheAmount || 0);
      setValue('notes', initialData.notes || '');
    } else {
      setValue('classId', classId);
      if (attendanceWindowId) {
        setValue('attendanceWindowId', attendanceWindowId);
      }
    }
  }, [initialData, setValue, classId, attendanceWindowId]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateOfferingInput | UpdateOfferingInput) => {
    try {
      setLoading(true);
      if (isEditing && initialData?.id) {
        await offeringsApi.update(initialData.id, data as UpdateOfferingInput);
        toast.success('Offering record updated successfully');
      } else {
        await offeringsApi.create(data as CreateOfferingInput);
        toast.success('Offering record created successfully');
      }
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} offering record`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isEditing && (
        <Select
          label="Attendance Window"
          {...register('attendanceWindowId')}
          error={errors.attendanceWindowId?.message}
          options={[
            { value: '', label: 'Select attendance window' },
            ...windows.map((window) => ({
              value: window.id,
              label: `${new Date(window.sundayDate).toLocaleDateString()} (${new Date(window.opensAt).toLocaleDateString()} - ${new Date(window.closesAt).toLocaleDateString()})`,
            })),
          ]}
          disabled={loadingWindows}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Offering Amount"
          type="number"
          step="0.01"
          {...register('offeringAmount', { valueAsNumber: true })}
          error={errors.offeringAmount?.message}
          placeholder="0.00"
        />
        <Input
          label="Tithe Amount"
          type="number"
          step="0.01"
          {...register('titheAmount', { valueAsNumber: true })}
          error={errors.titheAmount?.message}
          placeholder="0.00"
        />
      </div>

      <Textarea
        label="Notes (Optional)"
        rows={3}
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Additional notes about this offering..."
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}

