import { z } from 'zod';

export const alumniProfileSchema = z.object({
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
  expertise: z.array(z.string()).optional(),
});

export type AlumniProfileDTO = z.infer<typeof alumniProfileSchema>;
