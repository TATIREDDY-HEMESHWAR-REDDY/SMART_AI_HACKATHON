import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function usersRoutes(server: FastifyInstance) {
  
  // GET /api/v1/users/:id
  server.get('/:id', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // PRIVACY FIX: Only allow the user themselves, or admins/faculty to view the profile
    if (request.user.id !== id && !request.user.roles.some((r: string) => ['COLLEGE_ADMIN', 'ADMIN', 'FACULTY'].includes(r))) {
      return reply.status(403).send({ success: false, message: 'Forbidden: Cannot view other users\' profiles' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        institutionId: true,
        roles: { include: { role: true } },
        studentProfile: true,
        facultyProfile: true,
      }
    });

    if (!user) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    // Don't leak passwords or refresh tokens, only return safe profile data
    const roles = user.roles.map((r: any) => r.role.name);

    return { 
      success: true, 
      data: {
        id: user.id,
        email: user.email,
        institutionId: user.institutionId,
        roles,
        profile: user.studentProfile || user.facultyProfile || null
      }
    };
  });

  // GET /api/v1/users/students/:id
  server.get('/students/:id', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // PRIVACY FIX: Only allow the user themselves, or admins/faculty to view the student profile
    if (request.user.id !== id && !request.user.roles.some((r: string) => ['COLLEGE_ADMIN', 'ADMIN', 'FACULTY'].includes(r))) {
      return reply.status(403).send({ success: false, message: 'Forbidden: Cannot view other students\' profiles' });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: id },
      include: {
        program: {
          include: { department: true }
        },
        enrollments: {
          include: {
            course: true,
          }
        }
      }
    });

    if (!studentProfile) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });
    }

    return { success: true, data: studentProfile };
  });

}
