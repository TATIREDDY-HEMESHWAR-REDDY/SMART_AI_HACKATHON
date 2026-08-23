import { api } from './api';

export interface CareerGoal {
  id: number;
  student_id: string;
  title: string;
  target_role?: string;
  target_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapTask {
  id: number;
  student_id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  source: string;
  status: string;
  reference_type?: string;
  reference_id?: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
}

export interface ReadinessDict {
  overall_score?: number;
  coding_score?: number;
  aptitude_score?: number;
  technical_score?: number;
  communication_score?: number;
  interview_score?: number;
  resume_score?: number;
  projects_score?: number;
}

export interface RoadmapResponse {
  goal?: CareerGoal;
  readiness?: ReadinessDict;
  tasks: RoadmapTask[];
  high_priority_tasks: RoadmapTask[];
  completed_tasks: number;
  progress_percentage: number;
  career_gaps: string[];
}

export interface CoachResponse {
  answer: string;
  key_points: string[];
  recommended_actions: string[];
  referenced_gaps: string[];
  confidence: number;
}

export const roadmapService = {
  getRoadmap: async (): Promise<RoadmapResponse> => {
    const response = await api.get('/career/roadmap');
    return response.data;
  },

  generateRoadmap: async (): Promise<RoadmapTask[]> => {
    const response = await api.post('/career/roadmap/generate');
    return response.data;
  },

  updateTaskStatus: async (taskId: number, status: string): Promise<RoadmapTask> => {
    const response = await api.patch(`/career/roadmap/tasks/${taskId}`, { status });
    return response.data;
  },

  createGoal: async (title: string, target_role?: string, target_date?: string): Promise<CareerGoal> => {
    const response = await api.post('/career/roadmap/goals', { title, target_role, target_date });
    return response.data;
  },
  
  chatWithCoach: async (message: string): Promise<CoachResponse> => {
    const response = await api.post('/career/coach/chat', { message });
    return response.data;
  }
};
