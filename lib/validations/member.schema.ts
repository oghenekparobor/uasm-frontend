import { z } from 'zod';

export const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  birthday: z.string().optional().or(z.literal('')),
  currentClassId: z.string().uuid('Invalid class ID').min(1, 'Class is required'),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

