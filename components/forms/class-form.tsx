'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  createClassSchema, 
  updateClassSchema,
  type CreateClassInput,
  type UpdateClassInput 
} from '@/lib/validations/class.schema';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { classesApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function ClassForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ClassFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateClassInput | UpdateClassInput>({
    resolver: zodResolver(isEditing ? updateClassSchema : createClassSchema),
    mode: 'onChange', // Enable real-time validation
  });

  useEffect(() => {
    if (isOpen && initialData) {
      Object.keys(initialData).forEach((key) => {
        setValue(key as any, initialData[key]);
      });
    } else {
      reset();
    }
  }, [isOpen, initialData, reset, setValue]);

  const onSubmit = async (data: CreateClassInput | UpdateClassInput) => {
    try {
      setLoading(true);
      if (isEditing) {
        // Only send name for updates
        await classesApi.update(initialData.id, { name: (data as UpdateClassInput).name });
        toast.success('Class updated successfully');
      } else {
        await classesApi.create(data as CreateClassInput);
        toast.success('Class created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Class Name"
        {...register('name')}
        error={errors.name?.message}
      />

      {!isEditing && (
      <Select
        label="Type"
        {...register('type')}
          error={(errors as any).type?.message}
        options={[
          { value: '', label: 'Select type' },
          { value: 'PLATOON', label: 'Platoon' },
            { value: 'CHILDREN', label: 'Children Class' },
        ]}
      />
      )}

      {isEditing && initialData?.type && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
            {initialData.type === 'PLATOON' ? 'Platoon' : 'Children Class'}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

