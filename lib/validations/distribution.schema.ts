import { z } from 'zod';

export const confirmReceiptSchema = z.object({
  attendanceWindowId: z.string().uuid('Attendance window ID is required'),
  totalFoodReceived: z.number().int().min(0, 'Food amount must be 0 or greater'),
  totalWaterReceived: z.number().int().min(0, 'Water amount must be 0 or greater'),
});

export const allocateFoodSchema = z.object({
  distributionBatchId: z.string().uuid('Batch ID is required'),
  classId: z.string().uuid('Class ID is required'),
  foodAllocated: z.number().int().min(0, 'Food allocated must be 0 or greater'),
  waterAllocated: z.number().int().min(0, 'Water allocated must be 0 or greater'),
  allocationType: z.enum(['DEFAULT', 'EXTRA'], {
    required_error: 'Allocation type is required',
  }),
});

export type ConfirmReceiptInput = z.infer<typeof confirmReceiptSchema>;
export type AllocateFoodInput = z.infer<typeof allocateFoodSchema>;

