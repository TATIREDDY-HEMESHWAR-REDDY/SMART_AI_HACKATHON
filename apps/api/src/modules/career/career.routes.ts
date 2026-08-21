import { FastifyInstance } from 'fastify';
import { updateCareerProfileSchema, addStudentSkillSchema } from './career.schema';
import { careerDataLayer } from './career.data';
import { ApiSuccessResponse } from '@campus-os/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function careerRoutes(server: FastifyInstance) {

  // ==========================================
  // HELPER: Resolve StudentProfile.id
  // ==========================================
  const getStudentProfileId = async (userId: string): Promise<string | null> => {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId }
      });
      return profile?.id || null;
    } catch (err) {
      return null;
    }
  };

  // ==========================================
  // CAREER PROFILE
  // ==========================================

  server.get('/profile/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found for this user' }
      });
      return;
    }

    const goals = await careerDataLayer.getCareerGoalsByStudent(studentId);
    const skills = await careerDataLayer.getStudentSkills(studentId);

    const activeGoal = goals[0] || null;

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        careerGoal: activeGoal ? {
          targetRole: activeGoal.targetRole,
          targetIndustry: activeGoal.targetIndustry,
          isActive: activeGoal.isActive,
        } : null,
        skills: skills.map(ss => ({
          id: ss.id,
          skillId: ss.skillId,
          name: ss.skill?.name,
          proficiencyLevel: ss.proficiencyLevel,
          isVerified: ss.isVerified
        }))
      }
    };
    return response;
  });

  server.post('/profile/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const parsed = updateCareerProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
      });
      return;
    }

    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found for this user' }
      });
      return;
    }

    const { targetRole, targetIndustry } = parsed.data;
    const updatedGoal = await careerDataLayer.upsertCareerGoal(studentId, targetRole, targetIndustry);

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        careerGoal: {
          targetRole: updatedGoal.targetRole,
          targetIndustry: updatedGoal.targetIndustry,
          isActive: updatedGoal.isActive
        }
      }
    };
    return response;
  });


  // ==========================================
  // SKILL CATALOG
  // ==========================================

  server.get('/skills', async (request, reply) => {
    // Publicly viewable catalog of standard skills
    const skills = await careerDataLayer.getSkills();

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        skills
      }
    };
    return response;
  });

  server.post('/skills/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const parsed = addStudentSkillSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
      });
      return;
    }

    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found for this user' }
      });
      return;
    }

    const { skillId, proficiencyLevel } = parsed.data;

    try {
      const studentSkill = await careerDataLayer.addStudentSkill(studentId, skillId, proficiencyLevel);
      
      const response: ApiSuccessResponse = {
        success: true,
        data: {
          studentSkill: {
            id: studentSkill.id,
            skillId: studentSkill.skillId,
            proficiencyLevel: studentSkill.proficiencyLevel,
            isVerified: studentSkill.isVerified
          }
        }
      };
      return response;
    } catch (err: any) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message || 'Skill not found' }
      });
    }
  });


  // ==========================================
  // CAREER ASSESSMENT
  // ==========================================

  server.get('/assessments', { preValidation: [server.requireAuth, server.requireRole(['STUDENT', 'TPO'])] }, async (request, reply) => {
    const assessments = await careerDataLayer.getAssessments();
    const response: ApiSuccessResponse = {
      success: true,
      data: { assessments }
    };
    return response;
  });

  server.post('/assessments/start', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const { startAssessmentSchema } = await import('./career.schema');
    const parsed = startAssessmentSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
      });
      return;
    }

    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
      return;
    }

    try {
      // Initialize assessment state without faking a result
      // Boundary for future Team 3 integration: POST /ai/career/assessment
      const session = await careerDataLayer.startAssessment(studentId, parsed.data.assessmentId);
      const response: ApiSuccessResponse = {
        success: true,
        data: { assessmentSession: session }
      };
      return response;
    } catch (err: any) {
      reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: err.message }
      });
    }
  });

  server.get('/assessments/me/results', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
      return;
    }

    const results = await careerDataLayer.getAssessmentResults(studentId);
    const response: ApiSuccessResponse = {
      success: true,
      data: { assessmentResults: results }
    };
    return response;
  });

  server.get('/readiness/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
      return;
    }

    const readiness = await careerDataLayer.getReadinessScore(studentId);
    const response: ApiSuccessResponse = {
      success: true,
      data: { readiness }
    };
    return response;
  });

  // GET /api/v1/career/analytics/dashboard
  // Roles: TPO, FACULTY
  server.get('/analytics/dashboard', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['TPO', 'FACULTY'])]
  }, async (request, reply) => {
    const data = await careerDataLayer.getAnalyticsDashboard();
    return reply.send({ success: true, data });
  });

}
