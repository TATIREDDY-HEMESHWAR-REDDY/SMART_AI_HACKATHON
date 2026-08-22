import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1),
  website: z.string().url(),
  industry: z.string().min(1)
});

export const verifyCompanySchema = z.object({
  status: z.enum(['REGISTERED', 'PENDING_VERIFICATION', 'VALIDATING', 'VERIFIED', 'ACTIVE'])
});

export const createDriveSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  registrationDeadline: z.string().datetime()
});

export const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  packageDetails: z.string(),
  location: z.string().min(1),
  skills: z.array(z.string()).optional(),
  selectionSteps: z.array(z.string()).optional(),
  eligibility: z.object({
    minCgpa: z.number().min(0).max(10),
    allowedBranches: z.array(z.string()),
    maxBacklogs: z.number().int().min(0)
  }).optional()
});
