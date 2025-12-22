'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserInput } from '@/lib/validations/user.schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usersApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function UserForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: UserFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange', // Enable real-time validation
  });

  useEffect(() => {
    if (isOpen && initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key !== 'password') {
          setValue(key as any, initialData[key]);
        }
      });
    } else {
      reset();
    }
  }, [isOpen, initialData, reset, setValue]);

  const onSubmit = async (data: CreateUserInput) => {
    try {
      setLoading(true);
      if (initialData) {
        await usersApi.update(initialData.id, data);
        toast.success('User updated successfully');
      } else {
        await usersApi.create(data);
        toast.success('User created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save user');
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
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Phone"
        {...register('phone')}
        error={errors.phone?.message}
      />

      {!initialData && (
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="At least 8 characters with uppercase, lowercase, number, and special character"
        />
      )}

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

