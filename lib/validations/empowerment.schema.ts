import { z } from 'zod';

export const createEmpowermentSchema = z.object({
  memberId: z.string().uuid('Member ID is required'),
  type: z.enum(['SKILL', 'MONEY', 'DRUG', 'ITEM'], {
    required_error: 'Empowerment type is required',
  }),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export const approveEmpowermentSchema = z.object({
  empowermentId: z.string().uuid(),
  adminNotes: z.string().optional().or(z.literal('')),
});

export type CreateEmpowermentInput = z.infer<typeof createEmpowermentSchema>;
export type ApproveEmpowermentInput = z.infer<typeof approveEmpowermentSchema>;

