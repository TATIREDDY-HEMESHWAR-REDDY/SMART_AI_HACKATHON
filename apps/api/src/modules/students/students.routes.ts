import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  internships: z.array(z.string()).optional(),
  careerGoal: z.string().optional(),
});

export default async function studentRoutes(server: FastifyInstance) {
  
  // GET /api/v1/students/me
  server.get('/me', { preValidation: [server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: request.user.id },
      include: {
        user: { select: { email: true } },
        program: { include: { department: true } },
        enrollments: { include: { course: true } }
      }
    });

    if (!studentProfile) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });
    }

    return { success: true, data: studentProfile };
  });

  // PUT /api/v1/students/me (Update Profile)
  server.put('/me', { preValidation: [server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: request.user.id },
      data: parsed.data
    });

    return { success: true, data: updatedProfile, message: 'Profile updated successfully' };
  });

  // GET /api/v1/students/:id
  server.get('/:id', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Security: If user is a STUDENT, they can only view their own profile.
    if (request.user.roles.includes('STUDENT') && request.user.id !== id) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You cannot view other students profiles' } });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: id },
      include: {
        user: { select: { email: true } },
        program: { include: { department: true } },
        enrollments: { include: { course: true } }
      }
    });

    if (!studentProfile) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });
    }

    return { success: true, data: studentProfile };
  });
}
