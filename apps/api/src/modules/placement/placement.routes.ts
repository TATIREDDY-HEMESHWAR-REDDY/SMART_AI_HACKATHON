import { FastifyInstance } from 'fastify';
import { PlacementData } from './placement.data';
import { createCompanySchema, verifyCompanySchema, createDriveSchema, createJobSchema } from './placement.schema';

export default async function placementRoutes(server: FastifyInstance) {
  server.addHook('onRequest', server.requireAuth);

  server.post('/companies', {
    preHandler: [server.requireRole(['RECRUITER', 'TPO'])],
    handler: async (request, reply) => {
      const data = createCompanySchema.parse(request.body);
      const company = await PlacementData.createCompany(data);
      return { success: true, data: { company } };
    }
  });

  server.patch('/companies/:id/verify', {
    preHandler: [server.requireRole(['TPO'])],
    handler: async (request: any, reply) => {
      const { id } = request.params;
      const data = verifyCompanySchema.parse(request.body);
      const company = await PlacementData.verifyCompany(id, data.status);
      if (!company) {
        return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } });
      }
      return { success: true, data: { company } };
    }
  });

  server.get('/recruiters/me', {
    preHandler: [server.requireRole(['RECRUITER'])],
    handler: async (request: any, reply) => {
      const recruiter = await PlacementData.getRecruiterMe(request.user.id);
      return { success: true, data: { recruiter } };
    }
  });

  server.post('/drives', {
    preHandler: [server.requireRole(['TPO'])],
    handler: async (request, reply) => {
      const data = createDriveSchema.parse(request.body);
      const drive = await PlacementData.createDrive(data);
      return { success: true, data: { drive } };
    }
  });

  server.post('/drives/:driveId/jobs', {
    preHandler: [server.requireRole(['TPO'])],
    handler: async (request: any, reply) => {
      const { driveId } = request.params;
      const data = createJobSchema.parse(request.body);
      const job = await PlacementData.createJob(driveId, data);
      return { success: true, data: { job } };
    }
  });
}
