import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface ERPSkill {
  id: number;
  name: string;
  level: string;
  score: number;
}

export interface ERPOpportunity {
  company: string;
  role: string;
  package: string;
  matchScore: number;
  deadline: string;
  gap: string;
}

export interface ERPProfile {
  targetRole: string;
  github: string;
  linkedin: string;
  skills: ERPSkill[];
  opportunities: ERPOpportunity[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  section?: string;
  semester?: number;
  cgpa?: number;
  erpProfile?: ERPProfile;
}

interface StudentContextType {
  student: Student | null;
  loading: boolean;
  authorized: boolean;
  fetchStudent: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const SESSION_KEY = 'career_os_session';

function parseERPParams(): { student: Student; authorized: true } | null {
  const p = new URLSearchParams(window.location.search);
  if (p.get('erp_session') !== '1') return null;

  const name = p.get('name') ?? 'Student';

  let erpProfile: ERPProfile | undefined;
  const raw = p.get('erp_data');
  if (raw) {
    try {
      erpProfile = JSON.parse(decodeURIComponent(atob(raw)));
    } catch {
      // malformed — ignore, still allow access since erp_session=1
    }
  }

  return {
    authorized: true,
    student: {
      id: 'erp-student',
      email: '',
      name,
      section: p.get('section') ?? undefined,
      cgpa: p.get('cgpa') ? Number(p.get('cgpa')) : undefined,
      semester: p.get('semester') ? Number(p.get('semester')) : undefined,
      erpProfile,
    },
  };
}

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      // 1 · Fresh handoff from ERP via URL params
      const fromERP = parseERPParams();
      if (fromERP) {
        setStudent(fromERP.student);
        setAuthorized(true);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(fromERP.student));
        return;
      }

      // 2 · Already authenticated this session (page navigation within Career OS)
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        setStudent(JSON.parse(stored));
        setAuthorized(true);
        return;
      }

      // 3 · Not from ERP — block access
      setAuthorized(false);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudent(); }, []);

  return (
    <StudentContext.Provider value={{ student, loading, authorized, fetchStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) throw new Error('useStudent must be used within a StudentProvider');
  return context;
}
