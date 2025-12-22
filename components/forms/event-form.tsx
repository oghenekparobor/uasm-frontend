'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { eventsApi, classesApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventForm({ isOpen, onClose, onSuccess }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    mode: 'onChange', // Real-time validation
  });

  const scope = watch('scope');

  useEffect(() => {
    if (isOpen && scope === 'CLASS_SPECIFIC') {
      const fetchClasses = async () => {
        try {
          const response = await classesApi.getAll({ limit: 100 });
          setClasses(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch classes:', error);
        }
      };
      fetchClasses();
    } else {
      reset();
    }
  }, [isOpen, scope, reset]);

  const onSubmit = async (data: CreateEventInput) => {
    try {
      setLoading(true);
      await eventsApi.create(data);
      toast.success('Event created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Event Title"
        {...register('title')}
        error={errors.title?.message}
      />

      <Textarea
        label="Description"
        rows={4}
        {...register('description')}
        error={errors.description?.message}
      />

      <Select
        label="Event Scope"
        {...register('scope')}
        error={errors.scope?.message}
        options={[
          { value: '', label: 'Select scope' },
          { value: 'GLOBAL', label: 'Global (All Classes)' },
          { value: 'CLASS_SPECIFIC', label: 'Class Specific' },
        ]}
      />

      {scope === 'CLASS_SPECIFIC' && (
        <Select
          label="Class"
          {...register('classId')}
          error={errors.classId?.message}
          options={[
            { value: '', label: 'Select class' },
            ...classes.map((cls) => ({
              value: cls.id,
              label: `${cls.name} (${cls.type})`,
            })),
          ]}
        />
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('isRecurring')}
          className="rounded border-gray-300"
        />
        <label className="text-sm">Recurring Event</label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}

