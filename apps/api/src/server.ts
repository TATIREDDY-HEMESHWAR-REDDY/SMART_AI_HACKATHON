import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { ApiErrorResponse } from '@campus-os/types';

import { authPlugin } from './plugins/auth';
import authRoutes from './modules/auth/auth.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import institutionRoutes from './modules/institution/institution.routes';
import usersRoutes from './modules/users/users.routes';
import departmentRoutes from './modules/departments/departments.routes';
import studentRoutes from './modules/students/students.routes';
import academicsRoutes from './modules/academics/academics.routes';

dotenv.config({ path: '../../.env' });

const server = Fastify({ logger: true });

// Plugins
server.register(cors, { origin: true });
server.register(authPlugin);

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

// Basic Health Route
server.get('/api/v1/health', async () => {
  return { success: true, data: { status: 'ok', timestamp: new Date().toISOString() } };
});

// Register Modules
server.register(authRoutes, { prefix: '/api/v1/auth' });
server.register(attendanceRoutes, { prefix: '/api/v1/attendance' });
server.register(institutionRoutes, { prefix: '/api/v1/institutions' });
server.register(usersRoutes, { prefix: '/api/v1/users' });
server.register(departmentRoutes, { prefix: '/api/v1/departments' });
server.register(studentRoutes, { prefix: '/api/v1/students' });
server.register(academicsRoutes, { prefix: '/api/v1/academics' });

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 API Server listening at http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
