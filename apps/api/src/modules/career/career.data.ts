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
  }
};
