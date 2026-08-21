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

}
