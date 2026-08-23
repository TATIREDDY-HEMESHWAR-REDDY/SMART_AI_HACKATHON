import axios from 'axios';

const SESSION_KEY = 'career_os_session';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Pass the ERP student_id so the backend queries the correct seeded student.
  const session = sessionStorage.getItem(SESSION_KEY);
  if (session) {
    try {
      const student = JSON.parse(session);
      if (student?.id) config.headers['X-Student-ID'] = student.id;
    } catch {}
  }
  return config;
});
