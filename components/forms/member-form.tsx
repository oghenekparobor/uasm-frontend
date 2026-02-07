'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema, type CreateMemberInput, type CreateMemberFormInput } from '@/lib/validations/member.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { membersApi, classesApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId?: string;
  initialData?: any;
}

export function MemberForm({
  isOpen,
  onClose,
  onSuccess,
  classId,
  initialData,
}: MemberFormProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateMemberFormInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      currentClassId: classId || '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch classes for dropdown
      const fetchClasses = async () => {
        try {
          const response = await classesApi.getAll({ limit: 100 });
          setClasses(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch classes:', error);
        }
      };
      fetchClasses();

      if (initialData) {
        Object.keys(initialData).forEach((key) => {
          if (key === 'birthday' && initialData[key]) {
            const date = new Date(initialData[key]);
            setValue('birthday', date.toISOString().split('T')[0]);
          } else if (key === 'age') {
            setValue('age', initialData.age != null ? String(initialData.age) : '');
          } else {
            setValue(key as any, initialData[key]);
          }
        });
      }
    } else {
      reset();
    }
  }, [isOpen, initialData, reset, setValue]);

  const onSubmit = async (data: CreateMemberFormInput) => {
    try {
      setLoading(true);
      const parsed = createMemberSchema.parse(data) as CreateMemberInput;
      if (initialData) {
        await membersApi.update(initialData.id, parsed);
        toast.success('Member updated successfully');
      } else {
        await membersApi.create(parsed);
        toast.success('Member created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        label="Date of Birth"
        type="date"
        {...register('birthday')}
        error={errors.birthday?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Occupation"
          {...register('occupation')}
          error={errors.occupation?.message}
          placeholder="e.g. Student, Teacher"
        />
        <Input
          label="Status"
          {...register('status')}
          error={errors.status?.message}
          placeholder="e.g. Active, Inactive"
        />
        <Input
          label="Age"
          type="number"
          min={0}
          max={150}
          {...register('age')}
          error={errors.age?.message}
          placeholder="Optional"
        />
        <Select
          label="Gender"
          {...register('gender')}
          error={errors.gender?.message}
          options={[
            { value: '', label: 'Select (optional)' },
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
          ]}
        />
      </div>

      <Textarea
        label="Address"
        rows={3}
        {...register('address')}
        error={errors.address?.message}
      />

      <Textarea
        label="Emergency Contact"
        rows={2}
        {...register('emergencyContact')}
        error={errors.emergencyContact?.message}
        placeholder="Name, relationship, and phone number"
      />

      <Select
        label="Class"
        {...register('currentClassId')}
        error={errors.currentClassId?.message}
        options={[
          { value: '', label: 'Select class' },
          ...classes.map((cls) => ({
            value: cls.id,
            label: `${cls.name} (${cls.type})`,
          })),
        ]}
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

