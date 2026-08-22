import { api } from './api';

export const careerService = {
  getProfile: async () => {
    const { data } = await api.get('/career/profile');
    return data;
  },
  updateProfile: async (profileData: any) => {
    const { data } = await api.put('/career/profile', profileData);
    return data;
  },
  getSkills: async () => {
    const { data } = await api.get('/career/skills');
    return data;
  },
  createSkill: async (skillData: any) => {
    const { data } = await api.post('/career/skills', skillData);
    return data;
  },
  deleteSkill: async (skillId: number) => {
    const { data } = await api.delete(`/career/skills/${skillId}`);
    return data;
  },
  getDashboard: async () => {
    const { data } = await api.get('/career/dashboard');
    return data;
  }
};
