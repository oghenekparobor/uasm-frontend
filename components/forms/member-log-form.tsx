'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createMemberLogSchema,
  type CreateMemberLogInput,
} from '@/lib/validations/member-log.schema';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { memberLogsApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface CreateMemberLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberId: string;
}

export function CreateMemberLogForm({
  isOpen,
  onClose,
  onSuccess,
  memberId,
}: CreateMemberLogFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateMemberLogInput>({
    resolver: zodResolver(createMemberLogSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateMemberLogInput) => {
    try {
      setLoading(true);
      await memberLogsApi.create(memberId, data);
      toast.success('Member log created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Textarea
        label="Note"
        rows={6}
        {...register('note')}
        error={errors.note?.message}
        placeholder="Enter a note about this member..."
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Log'}
        </Button>
      </div>
    </form>
  );
}

