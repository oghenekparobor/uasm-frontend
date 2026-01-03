import { z } from 'zod';

export const createOfferingSchema = z.object({
  classId: z.string().uuid('Class ID is required'),
  attendanceWindowId: z.string().uuid('Attendance window ID is required'),
  offeringAmount: z.number().min(0, 'Offering amount must be 0 or greater'),
  titheAmount: z.number().min(0, 'Tithe amount must be 0 or greater'),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export const updateOfferingSchema = z.object({
  offeringAmount: z.number().min(0, 'Offering amount must be 0 or greater').optional(),
  titheAmount: z.number().min(0, 'Tithe amount must be 0 or greater').optional(),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>;
export type UpdateOfferingInput = z.infer<typeof updateOfferingSchema>;

