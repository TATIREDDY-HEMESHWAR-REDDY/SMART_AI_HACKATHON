import { FastifyInstance } from 'fastify';
import { alumniData } from './alumni.data';
import { alumniProfileSchema, mentorshipRequestSchema, mentorshipRespondSchema, mentorshipSessionSchema, alumniEventSchema } from './alumni.schema';

export default async function alumniRoutes(server: FastifyInstance) {
  // GET /api/v1/alumni/directory
  // Roles: STUDENT, TPO, ALUMNI, FACULTY
  server.get('/directory', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['STUDENT', 'TPO', 'ALUMNI', 'FACULTY'])]
  }, async (request, reply) => {
    const directory = await alumniData.getDirectory();
    return reply.send({ success: true, data: directory });
  });

  // GET /api/v1/alumni/profile/me
  // Roles: ALUMNI
  server.get('/profile/me', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['ALUMNI'])]
  }, async (request, reply) => {
    const user = request.user as any;
    const profile = await alumniData.getProfileByUserId(user.id);
    
    if (!profile) {
      return reply.send({ success: true, data: null });
    }
    
    return reply.send({ success: true, data: profile });
  });

  // PUT /api/v1/alumni/profile/me
  // Roles: ALUMNI
  server.put('/profile/me', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['ALUMNI'])]
  }, async (request, reply) => {
    const user = request.user as any;
    const parsedBody = alumniProfileSchema.safeParse(request.body);
    
    if (!parsedBody.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid profile data', details: parsedBody.error.format() }
      });
    }

    const updatedProfile = await alumniData.updateProfile(user.id, parsedBody.data);
    return reply.send({ success: true, data: updatedProfile });
  });

  // POST /api/v1/alumni/mentorship/request
  // Roles: STUDENT
  server.post('/mentorship/request', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['STUDENT'])]
  }, async (request, reply) => {
    const user = request.user as any;
    const parsedBody = mentorshipRequestSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request' } });
    }
    const reqData = await alumniData.createMentorshipRequest(user.id, parsedBody.data.alumniId, parsedBody.data.message);
    return reply.send({ success: true, data: reqData });
  });

  // PATCH /api/v1/alumni/mentorship/requests/:id
  // Roles: ALUMNI
  server.patch('/mentorship/requests/:id', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['ALUMNI'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsedBody = mentorshipRespondSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid response' } });
    }
    const updated = await alumniData.updateMentorshipRequestStatus(id, parsedBody.data.status);
    if (!updated) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }
    return reply.send({ success: true, data: updated });
  });

  // POST /api/v1/alumni/mentorship/sessions
  // Roles: ALUMNI
  server.post('/mentorship/sessions', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['ALUMNI'])]
  }, async (request, reply) => {
    const parsedBody = mentorshipSessionSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid session data' } });
    }
    const session = await alumniData.createMentorshipSession(parsedBody.data.requestId, parsedBody.data.scheduledAt, parsedBody.data.meetingLink);
    return reply.send({ success: true, data: session });
  });

  // GET /api/v1/alumni/events
  // Roles: STUDENT, ALUMNI, TPO, FACULTY
  server.get('/events', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['STUDENT', 'ALUMNI', 'TPO', 'FACULTY'])]
  }, async (request, reply) => {
    const events = await alumniData.getEvents();
    return reply.send({ success: true, data: events });
  });

  // POST /api/v1/alumni/events
  // Roles: ALUMNI, TPO
  server.post('/events', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['ALUMNI', 'TPO'])]
  }, async (request, reply) => {
    const user = request.user as any;
    const parsedBody = alumniEventSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid event data' } });
    }
    const event = await alumniData.createEvent(user.id, parsedBody.data.title, parsedBody.data.description, parsedBody.data.date, parsedBody.data.location);
    return reply.send({ success: true, data: event });
  });
}
