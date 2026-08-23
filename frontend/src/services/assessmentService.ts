import { api } from './api';

export const assessmentService = {
  getAssessments: async (category?: string) => {
    const params = category ? { category } : {
  generateAssessment: async (prompt: string, category: string) => {
    const { data } = await api.post('/career/assessments/generate', { prompt, category });
    return data;
  },
  
  deleteAssessment: async (id: number) => {
    const { data } = await api.delete(`/career/assessments/${id}`);
    return data;
  },
};

    const { data } = await api.get('/career/assessments', { params });
    return data;
  },
  
  getAssessment: async (id: number) => {
    const { data } = await api.get(`/career/assessments/${id}`);
    return data;
  },

  getQuestions: async (id: number) => {
    const { data } = await api.get(`/career/assessments/${id}/questions`);
    return data;
  },

  startAttempt: async (assessmentId: number) => {
    const { data } = await api.post(`/career/assessments/${assessmentId}/attempts`);
    return data;
  },

  getAttempt: async (attemptId: number) => {
    const { data } = await api.get(`/career/attempts/${attemptId}`);
    return data;
  },

  saveAnswer: async (attemptId: number, answerData: any) => {
    const { data } = await api.patch(`/career/attempts/${attemptId}/answers`, answerData);
    return data;
  },

  submitAttempt: async (attemptId: number) => {
    const { data } = await api.post(`/career/attempts/${attemptId}/submit`);
    return data;
  },

  getResult: async (attemptId: number) => {
    const { data } = await api.get(`/career/attempts/${attemptId}/result`);
    return data;
  },

  getReview: async (attemptId: number) => {
    const { data } = await api.get(`/career/attempts/${attemptId}/review`);
    return data;
  },

  generateAssessment: async (prompt: string, category: string) => {
    const { data } = await api.post('/career/assessments/generate', { prompt, category });
    return data;
  },
  
  deleteAssessment: async (id: number) => {
    const { data } = await api.delete(`/career/assessments/${id}`);
    return data;
  },
};

