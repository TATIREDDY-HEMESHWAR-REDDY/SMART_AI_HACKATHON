import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { loginSchema, registerSchema } from './auth.schema';
import { ApiSuccessResponse } from '@campus-os/types';

const prisma = new PrismaClient();

export default async function authRoutes(server: FastifyInstance) {
  
  server.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const { email, password, firstName, lastName, enrollmentNumber } = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'Email already exists' } });
    }

    // Get Student role and default Institution (HVK-MAIN)
    const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
    const institution = await prisma.institution.findUnique({ where: { code: 'HVK-MAIN' } });
    const program = await prisma.program.findFirst();

    if (!studentRole || !institution || !program) {
      return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: 'System not seeded properly for registration' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        institutionId: institution.id,
        roles: { create: { roleId: studentRole.id } },
        studentProfile: {
          create: {
            firstName,
            lastName,
            enrollmentNumber,
            programId: program.id
          }
        }
      }
    });

    return { success: true, message: 'Registration successful. You can now log in.' };
  });

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
    const roles = user.roles.map((r: any) => r.role.name);

    // Sign Access Token (1 hour) and Refresh Token (7 days)
    const token = server.jwt.sign({ id: user.id, roles }, { expiresIn: '1h' });
    const refreshToken = server.jwt.sign({ id: user.id, type: 'refresh' }, { expiresIn: '7d' });

    // Store Refresh Token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const response = {
      success: true,
      data: {
        token,
        refreshToken,
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

  server.post('/logout', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string } || {};
    
    // Invalidate refresh token if provided
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId: request.user.id }
      });
    }

    return { success: true, message: 'Logged out successfully' };
  });

  server.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string } || {};
    
    if (!refreshToken) {
      reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'Refresh token required' } });
      return;
    }

    try {
      // Verify signature
      const decoded = server.jwt.verify(refreshToken) as any;
      if (decoded.type !== 'refresh') throw new Error('Invalid token type');

      // Verify exists in DB and is not expired
      const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!dbToken) {
        throw new Error('Refresh token revoked or invalid');
      }

      if (dbToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: dbToken.id } });
        throw new Error('Refresh token expired');
      }

      // Get user and generate new access token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { roles: { include: { role: true } } }
      });

      if (!user) throw new Error('User not found');

      const roles = user.roles.map((r: any) => r.role.name);
      const token = server.jwt.sign({ id: user.id, roles }, { expiresIn: '1h' });

      return { success: true, data: { token } };
    } catch (err: any) {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: err.message || 'Invalid refresh token' }
      });
    }
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

    const roles = user.roles.map((r: any) => r.role.name);

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
