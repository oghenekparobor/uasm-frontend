'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
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
    if (isOpen && scope === 'CLASS') {
      const fetchClasses = async () => {
        try {
          const response = await classesApi.getAll({ limit: 100 });
          setClasses(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch classes:', error);
        }
      };
      fetchClasses();
    }
  }, [isOpen, scope]);

  const onSubmit = async (data: CreateEventInput) => {
    try {
      setLoading(true);
      await eventsApi.create(data);
      toast.success('Event created successfully');
      reset();
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

      <div>
        <label className="block text-sm font-medium mb-2">
          Event Date <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          {...register('eventDate')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
            errors.eventDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
          }`}
        />
        {errors.eventDate && (
          <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>
        )}
      </div>

      <Select
        label="Event Scope"
        {...register('scope')}
        error={errors.scope?.message}
        options={[
          { value: '', label: 'Select scope' },
          { value: 'GLOBAL', label: 'Global (All Classes)' },
          { value: 'CLASS', label: 'Class Specific' },
        ]}
      />

      {scope === 'CLASS' && (
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

