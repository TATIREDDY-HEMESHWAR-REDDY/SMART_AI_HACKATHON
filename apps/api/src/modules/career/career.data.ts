import { randomUUID } from 'crypto';

// ============================================================================
// TEMPORARY — REPLACE WITH PRISMA AFTER TEAM 1 SCHEMA INTEGRATION
// ============================================================================

export interface TemporarySkill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface TemporaryStudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  isVerified: boolean;
}

export interface TemporaryCareerGoal {
  id: string;
  studentId: string;
  targetRole: string;
  targetIndustry: string;
  isActive: boolean;
}

export interface TemporaryAssessment {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
}

export interface TemporaryAssessmentResult {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  completedAt: string;
}

export interface TemporaryAssessmentSession {
  id: string;
  studentId: string;
  assessmentId: string;
  status: 'IN_PROGRESS' | 'EVALUATING';
  startedAt: string;
}

const mockAssessments: TemporaryAssessment[] = [
  { id: 'cccccccc-1111-4444-8888-aaaaaaaaaaaa', title: 'Software Engineering Fundamentals', type: 'Technical', durationMinutes: 45 },
  { id: 'cccccccc-2222-4444-8888-aaaaaaaaaaaa', title: 'General Aptitude & Reasoning', type: 'Aptitude', durationMinutes: 30 },
  { id: 'cccccccc-3333-4444-8888-aaaaaaaaaaaa', title: 'Behavioral & Soft Skills', type: 'Behavioral', durationMinutes: 20 },
];

let mockAssessmentResults: TemporaryAssessmentResult[] = [];
let mockAssessmentSessions: TemporaryAssessmentSession[] = [];

const mockSkills: TemporarySkill[] = [
  { id: 'bbbbbbbb-1111-4444-8888-aaaaaaaaaaaa', name: 'React', category: 'Technical' },
  { id: 'bbbbbbbb-2222-4444-8888-aaaaaaaaaaaa', name: 'Node.js', category: 'Technical' },
  { id: 'bbbbbbbb-3333-4444-8888-aaaaaaaaaaaa', name: 'Communication', category: 'Soft' },
];

let mockStudentSkills: TemporaryStudentSkill[] = [];
let mockCareerGoals: TemporaryCareerGoal[] = [];

export const careerDataLayer = {
  getSkills: async () => {
    return mockSkills;
  },
  
  getCareerGoalsByStudent: async (studentId: string) => {
    return mockCareerGoals.filter(goal => goal.studentId === studentId && goal.isActive);
  },
  
  upsertCareerGoal: async (studentId: string, targetRole: string, targetIndustry: string) => {
    // Deactivate existing
    mockCareerGoals = mockCareerGoals.map(g => 
      g.studentId === studentId ? { ...g, isActive: false } : g
    );
    
    const newGoal: TemporaryCareerGoal = {
      id: randomUUID(),
      studentId,
      targetRole,
      targetIndustry,
      isActive: true,
    };
    mockCareerGoals.push(newGoal);
    return newGoal;
  },
  
  getStudentSkills: async (studentId: string) => {
    return mockStudentSkills
      .filter(ss => ss.studentId === studentId)
      .map(ss => {
        const skill = mockSkills.find(s => s.id === ss.skillId);
        return { ...ss, skill };
      });
  },
  
  addStudentSkill: async (studentId: string, skillId: string, proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT') => {
    // Check if skill exists globally
    const skillExists = mockSkills.some(s => s.id === skillId);
    if (!skillExists) throw new Error('Skill not found');
    
    // Check if already mapped
    const existingIndex = mockStudentSkills.findIndex(ss => ss.studentId === studentId && ss.skillId === skillId);
    if (existingIndex >= 0) {
      // Update existing
      mockStudentSkills[existingIndex].proficiencyLevel = proficiencyLevel;
      return mockStudentSkills[existingIndex];
    }
    
    const newSkill: TemporaryStudentSkill = {
      id: randomUUID(),
      studentId,
      skillId,
      proficiencyLevel,
      isVerified: false
    };
    mockStudentSkills.push(newSkill);
    return newSkill;
  },

  // ==========================================
  // ASSESSMENT METHODS
  // ==========================================
  
  getAssessments: async () => {
    return mockAssessments;
  },

  startAssessment: async (studentId: string, assessmentId: string) => {
    const assessment = mockAssessments.find(a => a.id === assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    // Initialize an assessment session without generating a completed result
    // Triggering Team 3 AI integration would happen here or asynchronously
    const newSession: TemporaryAssessmentSession = {
      id: randomUUID(),
      studentId,
      assessmentId,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString()
    };
    
    mockAssessmentSessions.push(newSession);
    return newSession;
  },

  getAssessmentResults: async (studentId: string) => {
    return mockAssessmentResults
      .filter(ar => ar.studentId === studentId)
      .map(ar => {
        const assessment = mockAssessments.find(a => a.id === ar.assessmentId);
        return { ...ar, assessment };
      });
  },

  // ==========================================
  // READINESS
  // ==========================================

  getReadinessScore: async (studentId: string) => {
    // The frozen specification requires a Readiness Summary but does NOT define a numerical formula.
    // Returning a deterministic summary of metrics instead of a fabricated score.
    const goals = await careerDataLayer.getCareerGoalsByStudent(studentId);
    const results = mockAssessmentResults.filter(ar => ar.studentId === studentId);
    const skills = await careerDataLayer.getStudentSkills(studentId);
    
    return {
      score: null, // TEAM LEAD CLARIFICATION REQUIRED: Career Readiness scoring formula.
      status: 'Pending Team Lead Formula',
      metrics: {
        hasCareerGoal: goals.length > 0,
        assessmentsCompleted: results.length,
        skillsAcquired: skills.length
      },
      lastUpdated: new Date().toISOString()
    };
  }
};
