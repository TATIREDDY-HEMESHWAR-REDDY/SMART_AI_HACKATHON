import { z } from 'zod';

export const alumniProfileSchema = z.object({
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
  expertise: z.array(z.string()).optional(),
});

export type AlumniProfileDTO = z.infer<typeof alumniProfileSchema>;

export const mentorshipRequestSchema = z.object({
  alumniId: z.string().uuid(),
  message: z.string().min(10)
});

export const mentorshipRespondSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED'])
});

export const mentorshipSessionSchema = z.object({
  requestId: z.string().uuid(),
  scheduledAt: z.string(),
  meetingLink: z.string().url()
});

export const alumniEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string(), // ISO date string
  location: z.string()
});
