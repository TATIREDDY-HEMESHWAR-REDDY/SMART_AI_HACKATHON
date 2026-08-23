import { api } from './api';

export interface InterviewSetup {
  target_role: string;
  interview_type: string;
  mode: string;
  difficulty: string;
  num_questions: number;
}

export interface InterviewQuestion {
  id: number;
  session_id: number;
  question_number: number;
  question: string;
  category: string;
  difficulty: string;
  expected_topics?: string[];
  response?: InterviewResponse;
}

export interface InterviewResponse {
  id: number;
  question_id: number;
  answer: string;
  submitted_at: string;
  time_spent_seconds: number;
  score?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
}

export interface InterviewSession {
  id: number;
  student_id: string;
  target_role?: string;
  interview_type: string;
  mode: string;
  difficulty?: string;
  status: string;
  started_at: string;
  completed_at?: string;
  overall_score?: number;
  readiness_score?: number;
  duration_seconds: number;
  ai_summary?: {
    overall_summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    critical_improvements?: string[];
    recommended_topics?: string[];
    recommended_practice?: string[];
  };
}

export interface InterviewReview extends InterviewSession {
  questions: InterviewQuestion[];
}

export interface InterviewHistoryItem {
  id: number;
  target_role?: string;
  interview_type: string;
  mode: string;
  status: string;
  started_at: string;
  completed_at?: string;
  overall_score?: number;
  duration_seconds: number;
}

export interface InterviewAnalytics {
  total_interviews: number;
  average_score?: number;
  best_score?: number;
  history: InterviewHistoryItem[];
}

export const interviewService = {
  startInterview: async (setup: InterviewSetup) => {
    const response = await api.post<InterviewSession>('/career/interviews/', setup);
    return response.data;
  },

  listInterviews: async () => {
    const response = await api.get<InterviewHistoryItem[]>('/career/interviews/');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get<any>('/career/interviews/analytics');
    return response.data;
  },

  getInterview: async (id: number) => {
    const response = await api.get<InterviewSession>(`/career/interviews/${id}`);
    return response.data;
  },

  getQuestions: async (id: number) => {
    const response = await api.get<InterviewQuestion[]>(`/career/interviews/${id}/questions`);
    return response.data;
  },

  submitAnswer: async (sessionId: number, questionId: number, answer: string, time_spent_seconds: number) => {
    const response = await api.post<InterviewResponse>(`/career/interviews/${sessionId}/answer/${questionId}`, {
      answer,
      time_spent_seconds
    });
    return response.data;
  },

  completeInterview: async (sessionId: number) => {
    const response = await api.post<InterviewSession>(`/career/interviews/${sessionId}/complete`);
    return response.data;
  },

  getReview: async (sessionId: number) => {
    const response = await api.get<InterviewReview>(`/career/interviews/${sessionId}/review`);
    return response.data;
  }
};
