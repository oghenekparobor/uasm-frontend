'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRequestSchema, type CreateRequestInput } from '@/lib/validations/request.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { requestsApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestForm({ isOpen, onClose, onSuccess }: RequestFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    mode: 'onChange', // Real-time validation
  });

  const requestTypes = [
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'SUPPLIES', label: 'Supplies' },
    { value: 'AID', label: 'Aid' },
    { value: 'ABSENCE', label: 'Absence' },
    { value: 'ROLE_CHANGE', label: 'Role Change' },
    { value: 'OTHER', label: 'Other' },
  ];

  const onSubmit = async (data: CreateRequestInput) => {
    try {
      setLoading(true);
      await requestsApi.create(data);
      toast.success('Request created successfully');
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Request Type"
        {...register('type')}
        error={errors.type?.message}
        options={[
          { value: '', label: 'Select type' },
          ...requestTypes,
        ]}
      />

      <Textarea
        label="Description"
        rows={4}
        {...register('description')}
        error={errors.description?.message}
        placeholder="Describe your request..."
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}

