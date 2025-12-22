import { z } from 'zod';

export const createRequestSchema = z.object({
  type: z.string().min(1, 'Request type is required').max(50),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

