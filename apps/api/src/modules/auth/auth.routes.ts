import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { loginSchema } from './auth.schema';
import { ApiSuccessResponse } from '@campus-os/types';

const prisma = new PrismaClient();

export default async function authRoutes(server: FastifyInstance) {
  
  server.post('/login', async (request, reply) => {
    // Validate request body
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
      });
      return;
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true }
        },
        studentProfile: true,
        facultyProfile: true
      }
    });

    if (!user) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
      });
      return;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
      });
      return;
    }

    // Map roles
    const roles = user.roles.map(r => r.role.name);

    // Sign Token
    const token = server.jwt.sign({ id: user.id, roles });

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          institutionId: user.institutionId,
          roles,
          profile: user.studentProfile || user.facultyProfile || null
        }
      }
    };

    return response;
  });

  server.get('/me', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true }
        },
        studentProfile: true,
        facultyProfile: true
      }
    });

    if (!user) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
      return;
    }

    const roles = user.roles.map(r => r.role.name);

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        institutionId: user.institutionId,
        roles,
        profile: user.studentProfile || user.facultyProfile || null
      }
    };

    return response;
  });
}
