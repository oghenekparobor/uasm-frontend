'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createEmpowermentSchema,
  approveEmpowermentSchema,
  type CreateEmpowermentInput,
  type ApproveEmpowermentInput,
} from '@/lib/validations/empowerment.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { empowermentApi, membersApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface CreateEmpowermentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberId?: string;
}

export function CreateEmpowermentForm({
  isOpen,
  onClose,
  onSuccess,
  memberId,
}: CreateEmpowermentFormProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateEmpowermentInput>({
    resolver: zodResolver(createEmpowermentSchema),
    defaultValues: {
      memberId: memberId || '',
    },
    mode: 'onChange', // Real-time validation
  });

  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        try {
          const response = await membersApi.getAll({ limit: 100 });
          setMembers(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch members:', error);
        }
      };
      fetchMembers();

      if (memberId) {
        setValue('memberId', memberId);
      }
    } else {
      reset();
    }
  }, [isOpen, memberId, reset, setValue]);

  const onSubmit = async (data: CreateEmpowermentInput) => {
    try {
      setLoading(true);
      await empowermentApi.create(data);
      toast.success('Empowerment request created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Member"
        {...register('memberId')}
        error={errors.memberId?.message}
        options={[
          { value: '', label: 'Select member' },
          ...members.map((member) => ({
            value: member.id,
            label: `${member.firstName} ${member.lastName}`,
          })),
        ]}
      />

      <Select
        label="Empowerment Type"
        {...register('type')}
        error={errors.type?.message}
        options={[
          { value: '', label: 'Select type' },
          { value: 'SKILL', label: 'Skill' },
          { value: 'MONEY', label: 'Money' },
          { value: 'DRUG', label: 'Drug' },
          { value: 'ITEM', label: 'Item' },
        ]}
      />

      <Textarea
        label="Description"
        rows={4}
        {...register('description')}
        error={errors.description?.message}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Request'}
        </Button>
      </div>
    </form>
  );
}

interface ApproveEmpowermentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empowermentId: string;
  action: 'approve' | 'reject';
}

export function ApproveEmpowermentForm({
  isOpen,
  onClose,
  onSuccess,
  empowermentId,
  action,
}: ApproveEmpowermentFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApproveEmpowermentInput>({
    resolver: zodResolver(approveEmpowermentSchema),
    defaultValues: {
      empowermentId,
    },
    mode: 'onChange', // Real-time validation
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: ApproveEmpowermentInput) => {
    try {
      setLoading(true);
      if (action === 'approve') {
        await empowermentApi.approve(empowermentId);
        toast.success('Empowerment request approved');
      } else {
        await empowermentApi.reject(empowermentId, data);
        toast.success('Empowerment request rejected');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Textarea
        label="Admin Notes"
        rows={3}
        {...register('adminNotes')}
        error={errors.adminNotes?.message}
        placeholder="Optional notes for this decision"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {loading ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
        </Button>
      </div>
    </form>
  );
}

