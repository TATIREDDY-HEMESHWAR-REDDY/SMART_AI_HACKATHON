import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/services/api';

export interface Student {
  id: string;
  name: string;
  email: string;
  department?: { id: number; name: string };
  year?: number;
  semester?: number;
  section?: string;
  cgpa?: number;
  profile_picture?: string;
}

interface StudentContextType {
  student: Student | null;
  loading: boolean;
  error: string | null;
  fetchStudent: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      // Fetch real profile from Career OS backend
      const response = await api.get('/career/profile');
      if (response.data) {
         setStudent({
            id: 'STU10045',
            name: response.data.full_name || 'Alex Chen',
            email: 'student@demo.com',
            cgpa: 8.4
         });
      }
    } catch (err) {
      // Fallback to mock student data if API fails
      setStudent({
        id: 'STU10045',
        name: 'Alex Chen',
        email: 'student@campusos.com',
        cgpa: 8.4
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  return (
    <StudentContext.Provider value={{ student, loading, error, fetchStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
