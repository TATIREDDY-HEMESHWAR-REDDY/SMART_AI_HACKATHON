import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function departmentRoutes(server: FastifyInstance) {
  
  // GET /api/v1/departments
  server.get('/', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    
    if (!user?.institutionId) {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'User has no institution' } });
    }

    const departments = await prisma.department.findMany({
      where: { institutionId: user.institutionId },
      include: {
        programs: true,
        _count: { select: { courses: true } }
      }
    });

    return { success: true, data: departments };
  });
}
