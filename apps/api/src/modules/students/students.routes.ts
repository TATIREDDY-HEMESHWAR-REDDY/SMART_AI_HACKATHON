import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function studentRoutes(server: FastifyInstance) {
  
  // GET /api/v1/students/me
  server.get('/me', { preValidation: [server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: request.user.id },
      include: {
        program: { include: { department: true } },
        enrollments: { include: { course: true } }
      }
    });

    if (!studentProfile) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });
    }

    return { success: true, data: studentProfile };
  });

  // GET /api/v1/students/:id
  server.get('/:id', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: id },
      include: {
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
