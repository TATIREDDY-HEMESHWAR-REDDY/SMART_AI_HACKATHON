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

// Read student identity passed as URL params from the CampusOS ERP.
// URL shape: /career?name=John+Doe&section=A1&cgpa=8.4&semester=4
function readERPParams(): Partial<Student> | null {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  if (!name) return null;
  return {
    name,
    section: params.get('section') ?? undefined,
    cgpa: params.get('cgpa') ? Number(params.get('cgpa')) : undefined,
    semester: params.get('semester') ? Number(params.get('semester')) : undefined,
  };
}

const ERP_STUDENT_KEY = 'career_os_erp_student';

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = async () => {
    try {
      setLoading(true);

      // 1 · ERP handoff via URL params (takes priority)
      const erpParams = readERPParams();
      if (erpParams) {
        const erp: Student = {
          id: 'erp-student',
          email: '',
          name: erpParams.name ?? 'Student',
          section: erpParams.section,
          cgpa: erpParams.cgpa,
          semester: erpParams.semester,
        };
        setStudent(erp);
        // Persist so navigating within Career OS keeps the identity
        sessionStorage.setItem(ERP_STUDENT_KEY, JSON.stringify(erp));
        return;
      }

      // 2 · Already stored from a previous ERP handoff this session
      const stored = sessionStorage.getItem(ERP_STUDENT_KEY);
      if (stored) {
        setStudent(JSON.parse(stored));
        return;
      }

      // 3 · Fallback: check API connection then use mock
      const response = await api.get('/health');
      if (response.data) {
        setStudent({ id: 'STU10045', name: 'Sameer (Mock)', email: 'sameer@demo.com', cgpa: 8.4 });
      }
    } catch (err) {
      setError('Failed to fetch student data');
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
