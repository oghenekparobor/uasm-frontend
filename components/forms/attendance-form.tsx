'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  openAttendanceWindowSchema,
  takeAttendanceSchema,
  type OpenAttendanceWindowInput,
  type TakeAttendanceInput,
} from '@/lib/validations/attendance.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { attendanceApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface OpenWindowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OpenWindowForm({ isOpen, onClose, onSuccess }: OpenWindowFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OpenAttendanceWindowInput>({
    resolver: zodResolver(openAttendanceWindowSchema),
    mode: 'onChange', // Real-time validation
  });

  const onSubmit = async (data: OpenAttendanceWindowInput) => {
    try {
      setLoading(true);
      await attendanceApi.openWindow(data);
      toast.success('Attendance window opened successfully');
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to open window');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Sunday Date"
        type="date"
        {...register('sundayDate')}
        error={errors.sundayDate?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Opens At"
          type="datetime-local"
          {...register('opensAt')}
          error={errors.opensAt?.message}
        />
        <Input
          label="Closes At"
          type="datetime-local"
          {...register('closesAt')}
          error={errors.closesAt?.message}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Opening...' : 'Open Window'}
        </Button>
      </div>
    </form>
  );
}

interface TakeAttendanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId: string;
  windowId?: string;
}

export function TakeAttendanceForm({
  isOpen,
  onClose,
  onSuccess,
  classId,
  windowId,
}: TakeAttendanceFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TakeAttendanceInput>({
    resolver: zodResolver(takeAttendanceSchema),
    defaultValues: {
      classId,
      attendanceWindowId: windowId || '',
    },
    mode: 'onChange', // Real-time validation
  });

  if (windowId) {
    setValue('attendanceWindowId', windowId);
  }

  const onSubmit = async (data: TakeAttendanceInput) => {
    try {
      setLoading(true);
      await attendanceApi.submitAttendance(classId, data);
      toast.success('Attendance submitted successfully');
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Count"
        type="number"
        {...register('count', { valueAsNumber: true })}
        error={errors.count?.message}
      />

      <Textarea
        label="Notes"
        rows={3}
        {...register('notes')}
        error={errors.notes?.message}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Attendance'}
        </Button>
      </div>
    </form>
  );
}

