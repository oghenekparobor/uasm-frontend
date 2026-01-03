import { z } from 'zod';

export const createMemberLogSchema = z.object({
  note: z.string().min(1, 'Note is required').max(5000, 'Note must not exceed 5000 characters'),
});

export type CreateMemberLogInput = z.infer<typeof createMemberLogSchema>;

