import { FastifyInstance } from 'fastify';
import { alumniData } from './alumni.data';
import { alumniProfileSchema } from './alumni.schema';

export default async function alumniRoutes(server: FastifyInstance) {
  // GET /api/v1/alumni/directory
  // Roles: STUDENT, TPO, ALUMNI, FACULTY
  server.get('/directory', {
    preValidation: [(server as any).authenticate, (server as any).requireRole(['STUDENT', 'TPO', 'ALUMNI', 'FACULTY'])]
  }, async (request, reply) => {
    const directory = alumniData.getDirectory();
    return reply.send({ success: true, data: directory });
  });

  // GET /api/v1/alumni/profile/me
  // Roles: ALUMNI
  server.get('/profile/me', {
    preValidation: [(server as any).authenticate, (server as any).requireRole(['ALUMNI'])]
  }, async (request, reply) => {
    const user = request.user as any;
    const profile = alumniData.getProfileByUserId(user.id);
    
    if (!profile) {
      return reply.send({ success: true, data: null });
    }
    
    return reply.send({ success: true, data: profile });
  });

  // PUT /api/v1/alumni/profile/me
  // Roles: ALUMNI
  server.put('/profile/me', {
    preValidation: [(server as any).authenticate, (server as any).requireRole(['ALUMNI'])]
  }, async (request, reply) => {
    const user = request.user as any;
    const parsedBody = alumniProfileSchema.safeParse(request.body);
    
    if (!parsedBody.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid profile data', details: parsedBody.error.format() }
      });
    }

    const updatedProfile = alumniData.updateProfile(user.id, parsedBody.data);
    return reply.send({ success: true, data: updatedProfile });
  });
}
