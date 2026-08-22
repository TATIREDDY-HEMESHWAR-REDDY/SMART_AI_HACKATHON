import axios from 'axios';

const API_URL = '/api/v1/career/resumes';

export interface ResumeData {
  id?: number;
  title: string;
  template: string;
  is_default: boolean;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  educations: any[];
  experiences: any[];
  projects: any[];
  skills: any[];
  certifications: any[];
  achievements: any[];
  activities: any[];
  analyses?: any[];
}

export const resumeService = {
  getResumes: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getResume: async (id: number) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  createResume: async (data: any) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  updateResume: async (id: number, data: any) => {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
  },

  deleteResume: async (id: number) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  duplicateResume: async (id: number) => {
    const response = await axios.post(`${API_URL}/${id}/duplicate`);
    return response.data;
  },

  analyzeResume: async (id: number) => {
    const response = await axios.post(`${API_URL}/${id}/analyze`);
    return response.data;
  },
  
  matchJob: async (id: number, jobDescription: string, targetRole: string) => {
    const response = await axios.post(`${API_URL}/${id}/job-match`, {
      job_description: jobDescription,
      target_role: targetRole
    });
    return response.data;
  },
  
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
