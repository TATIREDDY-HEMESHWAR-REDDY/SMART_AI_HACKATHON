import { api } from './api';
import type { ResumeData } from './resumeService';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  employment_type: string;
  requirements: string[];
  is_active: boolean;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: number;
  job_id: number;
  saved_at: string;
  job: Job;
}

export interface JobMatchResponse {
  id: number;
  job_id: number;
  resume_id: number;
  job?: Job;
  resume?: ResumeData;
  match_score?: number;
  deterministic_score?: number;
  matched_skills: string[];
  missing_skills: string[];
  missing_keywords: string[];
  ai_strengths: string[];
  ai_gaps: string[];
  role_alignment?: string;
  recommendations: string[];
  ai_available: boolean;
  analyzed_at: string;
  is_stale: boolean;
}

export interface ApplicationActivity {
  id: number;
  activity_type: string;
  content: string;
  created_at: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  resume_id: number;
  status: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
  job: Job;
  activities: ApplicationActivity[];
}

export const jobService = {
  getJobs: async (search?: string, employmentType?: string, location?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (employmentType) params.append('employment_type', employmentType);
    if (location) params.append('location', location);
    
    const response = await api.get<Job[]>(`/career/jobs?${params.toString()}`);
    return response.data;
  },

  getJob: async (id: number) => {
    const response = await api.get<Job>(`/career/jobs/${id}`);
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await api.get<SavedJob[]>('/career/jobs/saved');
    return response.data;
  },

  saveJob: async (id: number) => {
    const response = await api.post(`/career/jobs/${id}/save`);
    return response.data;
  },

  unsaveJob: async (id: number) => {
    const response = await api.delete(`/career/jobs/${id}/save`);
    return response.data;
  },

  matchJob: async (jobId: number, resumeId: number, forceRefresh: boolean = false) => {
    const response = await api.post<JobMatchResponse>(
      `/career/jobs/${jobId}/match?resume_id=${resumeId}&force_refresh=${forceRefresh}`
    );
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get<JobApplication[]>('/career/applications');
    return response.data;
  },

  createApplication: async (jobId: number, resumeId: number) => {
    const response = await api.post<JobApplication>('/career/applications', {
      job_id: jobId,
      resume_id: resumeId,
    });
    return response.data;
  },
};
