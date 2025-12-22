import { z } from 'zod';

export const openAttendanceWindowSchema = z.object({
  sundayDate: z.string().min(1, 'Sunday date is required'),
  opensAt: z.string().min(1, 'Open time is required'),
  closesAt: z.string().min(1, 'Close time is required'),
});

export const takeAttendanceSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  attendanceWindowId: z.string().uuid('Attendance window ID is required'),
  count: z.number().int().positive('Count must be a positive number'),
  notes: z.string().optional().or(z.literal('')),
});

export type OpenAttendanceWindowInput = z.infer<typeof openAttendanceWindowSchema>;
export type TakeAttendanceInput = z.infer<typeof takeAttendanceSchema>;

