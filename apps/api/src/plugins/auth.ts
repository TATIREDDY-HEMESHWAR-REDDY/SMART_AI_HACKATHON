import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; roles?: string[]; type?: string };
    user: { id: string; roles: string[]; type?: string };
  }
}

export const authPlugin = fp(async (server: FastifyInstance, opts: any) => {
  server.register(jwt, {
    secret: process.env.AUTH_SECRET || 'super-secret-fallback-key-12345',
  });

  server.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      // Block refresh tokens from being used as access tokens
      if ((request.user as any).type === 'refresh') {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Refresh tokens cannot be used for API access' }
        });
      }
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }
  });

  server.decorate('requireRole', (roles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        // Block refresh tokens
        if ((request.user as any).type === 'refresh') {
          return reply.status(401).send({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Refresh tokens cannot be used for API access' }
          });
        }
        const userRoles = request.user.roles || [];
        
        const hasRole = roles.some(role => userRoles.includes(role));
        if (!hasRole) {
          return reply.status(403).send({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
          });
        }
      } catch (err) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }
    };
  });
});
