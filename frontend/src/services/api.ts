import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token - use stored token or mock token for development
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || 'mock_token';
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
