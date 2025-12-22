'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema, type CreateMemberInput } from '@/lib/validations/member.schema';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { membersApi, classesApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';
import { useFormValidation } from '@/hooks/use-form-validation';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId?: string;
  initialData?: any;
}

/**
 * Enhanced Member Form with real-time validation feedback
 */
export function MemberFormEnhanced({
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
    watch,
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      currentClassId: classId || '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  // Watch form values for real-time validation
  const watchedValues = watch();

  // Use custom validation hook for additional feedback
  const {
    validateField,
    setFieldTouched,
    getFieldHasError,
    clearErrors,
    reset: resetValidation,
  } = useFormValidation(createMemberSchema, initialData);

  useEffect(() => {
    if (isOpen) {
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
          } else {
            setValue(key as any, initialData[key]);
          }
        });
      }
    } else {
      reset();
      resetValidation();
      clearErrors();
    }
  }, [isOpen, initialData, reset, setValue, resetValidation, clearErrors]);

  // Real-time validation on field change
  useEffect(() => {
    if (!isOpen) return;

    Object.keys(watchedValues).forEach((fieldName) => {
      const value = watchedValues[fieldName as keyof CreateMemberInput];
      if (value !== undefined && value !== '') {
        validateField(fieldName as keyof CreateMemberInput, value);
      }
    });
  }, [watchedValues, isOpen, validateField]);

  const onSubmit = async (data: CreateMemberInput) => {
    try {
      setLoading(true);
      if (initialData) {
        await membersApi.update(initialData.id, data);
        toast.success('Member updated successfully');
      } else {
        await membersApi.create(data);
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
        <div>
          <Input
            label="First Name"
            {...register('firstName', {
              onBlur: () => setFieldTouched('firstName'),
            })}
            error={errors.firstName?.message}
            className={
              getFieldHasError('firstName') ? 'border-red-500' : ''
            }
          />
        </div>
        <div>
          <Input
            label="Last Name"
            {...register('lastName', {
              onBlur: () => setFieldTouched('lastName'),
            })}
            error={errors.lastName?.message}
            className={
              getFieldHasError('lastName') ? 'border-red-500' : ''
            }
          />
        </div>
      </div>

      <Input
        label="Birthday"
        type="date"
        {...register('birthday', {
          onBlur: () => setFieldTouched('birthday'),
        })}
        error={errors.birthday?.message}
        className={getFieldHasError('birthday') ? 'border-red-500' : ''}
      />

      <Select
        label="Class"
        {...register('currentClassId', {
          onBlur: () => setFieldTouched('currentClassId'),
        })}
        error={errors.currentClassId?.message}
        className={getFieldHasError('currentClassId') ? 'border-red-500' : ''}
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

