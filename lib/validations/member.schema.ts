import { z } from 'zod';

export const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  birthday: z.string().optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number must not exceed 20 characters').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(255, 'Email must not exceed 255 characters').optional().or(z.literal('')),
  address: z.string().max(500, 'Address must not exceed 500 characters').optional().or(z.literal('')),
  emergencyContact: z.string().max(500, 'Emergency contact must not exceed 500 characters').optional().or(z.literal('')),
  currentClassId: z.string().uuid('Invalid class ID').min(1, 'Class is required'),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

