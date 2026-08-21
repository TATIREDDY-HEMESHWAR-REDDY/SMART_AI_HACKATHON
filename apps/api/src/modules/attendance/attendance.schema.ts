import { z } from 'zod';

export const markAttendanceSchema = z.object({
  records: z.array(z.object({
    studentId: z.string(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    remarks: z.string().optional()
  }))
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
