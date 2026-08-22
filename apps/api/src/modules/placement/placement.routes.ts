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
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const drive = await prisma.placementDrive.findUnique({ where: { id: driveId } });
      if (!drive) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Drive not found' } });
      if (drive.status === 'COMPLETED' || drive.status === 'CLOSED') {
        return reply.status(400).send({ success: false, error: { code: 'DRIVE_CLOSED', message: 'Cannot add jobs to a closed drive' } });
      }

      const data = createJobSchema.parse(request.body);
      const job = await PlacementData.createJob(driveId, data);
      return { success: true, data: { job } };
    }
  });

  server.patch('/drives/:driveId/status', {
    preHandler: [server.requireRole(['TPO'])],
    handler: async (request: any, reply) => {
      const { driveId } = request.params;
      const { status } = request.body;
      if (!['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CLOSED'].includes(status)) {
        return reply.status(400).send({ success: false, error: { code: 'INVALID_STATUS', message: 'Invalid status' } });
      }
      
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const drive = await prisma.placementDrive.update({
        where: { id: driveId },
        data: { status }
      });
      return { success: true, data: { drive } };
    }
  });

  server.get('/companies', async (request, reply) => {
    const companies = await PlacementData.getCompanies();
    return { success: true, data: { companies } };
  });

  server.get('/drives', async (request, reply) => {
    const drives = await PlacementData.getDrives();
    return { success: true, data: { drives } };
  });

  server.get('/jobs', async (request, reply) => {
    const jobs = await PlacementData.getJobs();
    return { success: true, data: { jobs } };
  });
}
