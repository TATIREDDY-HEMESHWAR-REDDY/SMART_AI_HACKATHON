import { api as axios } from './api';

const API_URL = '/career/coding';

export const codingService = {
  getProblems: async (topic?: string, difficulty?: string) => {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (difficulty) params.append('difficulty', difficulty);
    const response = await axios.get(`${API_URL}/problems`, { params });
    return response.data;
  },
  
  getProblem: async (slug: string) => {
    const response = await axios.get(`${API_URL}/problems/${slug}`);
    return response.data;
  },
  
  getProblemProgress: async (slug: string) => {
    const response = await axios.get(`${API_URL}/problems/${slug}/progress`);
    return response.data;
  },
  
  getSubmissions: async (problemId?: number) => {
    const params = new URLSearchParams();
    if (problemId) params.append('problem_id', problemId.toString());
    const response = await axios.get(`${API_URL}/submissions`, { params });
    return response.data;
  },
  
  runCode: async (slug: string, language: string, source_code: string) => {
    const response = await axios.post(`${API_URL}/problems/${slug}/run`, { language, source_code });
    return response.data;
  },
  
  submitCode: async (slug: string, language: string, source_code: string) => {
    const response = await axios.post(`${API_URL}/problems/${slug}/submit`, { language, source_code });
    return response.data;
  }
};
