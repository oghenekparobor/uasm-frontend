import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  type: z.enum(['PLATOON', 'CHILDREN']),
});

export const updateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100).optional(),
});

export const assignLeaderSchema = z.object({
  classId: z.string().uuid(),
  userId: z.string().uuid('User ID is required'),
  role: z.enum(['LEADER', 'ASSISTANT', 'TEACHER']),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type AssignLeaderInput = z.infer<typeof assignLeaderSchema>;

