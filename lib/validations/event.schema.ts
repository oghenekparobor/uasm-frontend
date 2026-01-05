import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  scope: z.enum(['GLOBAL', 'CLASS'], {
    required_error: 'Event scope is required',
  }),
  classId: z.string().uuid().optional().or(z.literal('')),
  eventDate: z.string().min(1, 'Event date is required'),
  isRecurring: z.boolean().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

