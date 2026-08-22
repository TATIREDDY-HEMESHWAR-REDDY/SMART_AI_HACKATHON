import { z } from 'zod';

export const updateCareerProfileSchema = z.object({
  targetRole: z.string().min(1, 'Target role is required'),
  targetIndustry: z.string().min(1, 'Target industry is required'),
  interests: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  internships: z.array(z.string()).optional(),
});

export type UpdateCareerProfileInput = z.infer<typeof updateCareerProfileSchema>;

export const addStudentSkillSchema = z.object({
  skillId: z.string().uuid('Invalid Skill ID'),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

export type AddStudentSkillInput = z.infer<typeof addStudentSkillSchema>;

export const startAssessmentSchema = z.object({
  assessmentId: z.string().uuid('Invalid Assessment ID'),
});

export type StartAssessmentInput = z.infer<typeof startAssessmentSchema>;

export const submitAssessmentSchema = z.object({
  sessionId: z.string(),
  assessmentId: z.string().uuid(),
  answers: z.any().optional(),
});

export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;

export const uploadResumeSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
});

export type UploadResumeInput = z.infer<typeof uploadResumeSchema>;

export const analyzeResumeSchema = z.object({
  resumeId: z.string().uuid(),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;

export const startMockInterviewSchema = z.object({ 
  role: z.string().min(1, 'Role is required') 
});
export type StartMockInterviewInput = z.infer<typeof startMockInterviewSchema>;

export const submitAnswerSchema = z.object({ 
  answer: z.string().min(1, 'Answer is required') 
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;