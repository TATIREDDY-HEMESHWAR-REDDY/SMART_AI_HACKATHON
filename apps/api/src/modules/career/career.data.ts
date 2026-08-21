
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const careerDataLayer = {
  getSkills: async () => {
    return prisma.skill.findMany();
  },
  
  getCareerGoalsByStudent: async (studentId: string) => {
    return prisma.careerGoal.findMany({ where: { studentId, isActive: true } });
  },
  
  upsertCareerGoal: async (studentId: string, targetRole: string, targetIndustry: string) => {
    await prisma.careerGoal.updateMany({
      where: { studentId, isActive: true },
      data: { isActive: false }
    });
    return prisma.careerGoal.create({
      data: { studentId, targetRole, targetIndustry, isActive: true }
    });
  },
  
  getStudentSkills: async (studentId: string) => {
    return prisma.studentSkill.findMany({
      where: { studentId },
      include: { skill: true }
    });
  },
  
  addStudentSkill: async (studentId: string, skillId: string, proficiencyLevel: string) => {
    const existing = await prisma.studentSkill.findUnique({
      where: { studentId_skillId: { studentId, skillId } }
    });
    if (existing) {
      return prisma.studentSkill.update({
        where: { id: existing.id },
        data: { proficiencyLevel }
      });
    }
    return prisma.studentSkill.create({
      data: { studentId, skillId, proficiencyLevel }
    });
  },

  getAssessments: async () => {
    return prisma.careerAssessment.findMany();
  },

  startAssessment: async (studentId: string, assessmentId: string) => {
    // Return a mock session response since we don't store sessions in Prisma
    return {
      id: 'session-' + Date.now(),
      studentId,
      assessmentId,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString()
    };
  },

  getAssessmentResults: async (studentId: string) => {
    return prisma.assessmentResult.findMany({
      where: { studentId },
      include: { assessment: true }
    });
  },

  getReadinessScore: async (studentId: string) => {
    const goals = await prisma.careerGoal.count({ where: { studentId } });
    const skills = await prisma.studentSkill.count({ where: { studentId } });
    const results = await prisma.assessmentResult.count({ where: { studentId } });
    
    const computedScore = Math.min(100, (goals > 0 ? 30 : 0) + (skills * 10) + (results * 20));
    const computedStatus = computedScore >= 80 ? 'Highly Ready' : computedScore >= 50 ? 'Developing' : 'Needs Action';

    return {
      score: computedScore,
      status: computedStatus,
      metrics: {
        hasCareerGoal: goals > 0,
        assessmentsCompleted: results,
        skillsCount: skills
      },
      lastUpdated: new Date().toISOString()
    };
  },

  getAnalyticsDashboard: async () => {
    return {
      topGoals: [],
      popularSkills: [],
      aggregateReadiness: {
        uniqueStudentsWithGoals: (await prisma.careerGoal.groupBy({ by: ['studentId'] })).length,
        uniqueStudentsWithSkills: (await prisma.studentSkill.groupBy({ by: ['studentId'] })).length,
        totalAssessmentsTaken: await prisma.assessmentResult.count()
      },
      lastUpdated: new Date().toISOString()
    };
  }
};

