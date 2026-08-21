import { z } from 'zod';

export const updateCareerProfileSchema = z.object({
  targetRole: z.string().min(1, 'Target role is required'),
  targetIndustry: z.string().min(1, 'Target industry is required'),
});

export type UpdateCareerProfileInput = z.infer<typeof updateCareerProfileSchema>;

export const addStudentSkillSchema = z.object({
  skillId: z.string().uuid('Invalid Skill ID'),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

export type AddStudentSkillInput = z.infer<typeof addStudentSkillSchema>;
