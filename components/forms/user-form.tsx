'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  createUserSchema, 
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput 
} from '@/lib/validations/user.schema';
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
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
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

  const onSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      setLoading(true);
      if (isEditing) {
        // Remove any fields that shouldn't be sent for update
        const updateData = { ...data } as UpdateUserInput;
        await usersApi.update(initialData.id, updateData);
        toast.success('User updated successfully');
      } else {
        await usersApi.create(data as CreateUserInput);
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

      {!isEditing && (
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={(errors as any).password?.message}
          placeholder="At least 8 characters with uppercase, lowercase, number, and special character"
        />
      )}

      {isEditing && (
        <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-md">
          💡 To change the password, use the "Change Password" option in the user menu.
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

