import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { ApiSuccessResponse, ApiErrorResponse } from '@campus-os/types';

dotenv.config({ path: '../../.env' });

const prisma = new PrismaClient();
const server = Fastify({ logger: true });

// Plugins
server.register(cors, { origin: true });
server.register(jwt, { secret: process.env.AUTH_SECRET || 'fallback-secret-key-12345' });

// Global Error Handler formatting
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
    },
  };
  reply.status(error.statusCode || 500).send(response);
});

// Basic Health/Me Route
server.get('/api/v1/health', async () => {
  return { success: true, data: { status: 'ok', timestamp: new Date().toISOString() } };
});

// Basic Login Route (Placeholder)
server.post('/api/v1/auth/login', async (request, reply) => {
  // TODO: Validate Zod schema, check DB password hash, sign JWT
  const { email, password } = request.body as any;
  
  const user = await prisma.user.findUnique({ where: { email }, include: { roles: { include: { role: true } } } });
  if (!user || password !== 'demo') { // Demo hardcode for MVP scaffold
    reply.status(401);
    throw new Error('Invalid credentials');
  }

  const token = server.jwt.sign({ id: user.id, roles: user.roles.map(r => r.role.name) });
  
  const response: ApiSuccessResponse<any> = {
    success: true,
    data: { token, user: { id: user.id, email: user.email } }
  };
  return response;
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server listening at http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
