'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClassSchema, type CreateClassInput } from '@/lib/validations/class.schema';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema),
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

  const onSubmit = async (data: CreateClassInput) => {
    try {
      setLoading(true);
      if (initialData) {
        await classesApi.update(initialData.id, data);
        toast.success('Class updated successfully');
      } else {
        await classesApi.create(data);
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

      <Select
        label="Type"
        {...register('type')}
        error={errors.type?.message}
        options={[
          { value: '', label: 'Select type' },
          { value: 'PLATOON', label: 'Platoon' },
          { value: 'CHILDREN_CLASS', label: 'Children Class' },
        ]}
      />

      <Input
        label="Capacity"
        type="number"
        {...register('capacity', { valueAsNumber: true })}
        error={errors.capacity?.message}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

