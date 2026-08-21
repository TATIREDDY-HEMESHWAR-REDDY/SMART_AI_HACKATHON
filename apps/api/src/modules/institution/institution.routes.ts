import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function institutionRoutes(server: FastifyInstance) {
  
  // GET /api/v1/institutions/me
  server.get('/me', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    
    if (!user?.institutionId) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'No institution associated with user' } });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: user.institutionId },
      include: {
        _count: {
          select: { users: true, departments: true }
        }
      }
    });

    return { success: true, data: institution };
  });

  // GET /api/v1/institutions/departments
  server.get('/departments', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    
    if (!user?.institutionId) {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'User has no institution' } });
    }

    const departments = await prisma.department.findMany({
      where: { institutionId: user.institutionId },
      include: {
        programs: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    return { success: true, data: departments };
  });
}
