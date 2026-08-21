import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'])
});

export default async function complaintsRoutes(server: FastifyInstance) {
  
  // POST /api/v1/complaints
  // Create a new complaint (Student or Faculty)
  server.post('/', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const parsed = createComplaintSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error.issues[0].message });
    }

    const complaint = await prisma.complaint.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        authorId: request.user.id
      }
    });

    return { success: true, data: complaint, message: 'Complaint submitted successfully' };
  });

  // GET /api/v1/complaints/me
  // Get my own complaints (Student or Faculty)
  server.get('/me', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const complaints = await prisma.complaint.findMany({
      where: { authorId: request.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: complaints };
  });

  // GET /api/v1/complaints
  // Get all complaints (Admin only)
  server.get('/', { preValidation: [server.requireRole(['COLLEGE_ADMIN', 'ADMIN', 'MAINTENANCE'])] }, async (request, reply) => {
    const complaints = await prisma.complaint.findMany({
      include: {
        author: {
          select: { email: true, studentProfile: true, facultyProfile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: complaints };
  });

  // PUT /api/v1/complaints/:id/status
  // Update complaint status (Admin only)
  server.put('/:id/status', { preValidation: [server.requireRole(['COLLEGE_ADMIN', 'ADMIN', 'MAINTENANCE'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateStatusSchema.safeParse(request.body);
    
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'Invalid status' });
    }

    const exists = await prisma.complaint.findUnique({ where: { id } });
    if (!exists) return reply.status(404).send({ success: false, message: 'Complaint not found' });

    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: parsed.data.status }
    });

    return { success: true, data: updated, message: 'Status updated successfully' };
  });
}
