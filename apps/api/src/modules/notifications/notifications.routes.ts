import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const broadcastSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  type: z.enum(['SYSTEM', 'ALERT', 'MESSAGE']).default('SYSTEM'),
  targetRole: z.enum(['ALL', 'STUDENT', 'FACULTY', 'PARENT'])
});

export default async function notificationsRoutes(server: FastifyInstance) {
  
  // GET /api/v1/notifications
  // Fetch unread notifications for logged-in user
  server.get('/', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // limit to last 20 for MVP
    });
    return { success: true, data: notifications };
  });

  // PUT /api/v1/notifications/:id/read
  // Mark as read
  server.put('/:id/read', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // Security Edge Case: verify user owns this notification
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return reply.status(404).send({ success: false, message: 'Not found' });
    if (notification.userId !== request.user.id) return reply.status(403).send({ success: false, message: 'Forbidden' });

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    return { success: true, data: updated };
  });

  // POST /api/v1/notifications/broadcast
  // Broadcast to roles (Admin only)
  server.post('/broadcast', { preValidation: [server.requireRole(['COLLEGE_ADMIN', 'ADMIN'])] }, async (request, reply) => {
    const parsed = broadcastSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.issues[0].message });

    const { title, message, type, targetRole } = parsed.data;

    let targetUsers: { id: string }[] = [];

    if (targetRole === 'ALL') {
      targetUsers = await prisma.user.findMany({ select: { id: true } });
    } else {
      targetUsers = await prisma.user.findMany({
        where: { roles: { some: { role: { name: targetRole } } } },
        select: { id: true }
      });
    }

    if (targetUsers.length === 0) {
      return { success: true, message: 'No users found for this role.' };
    }

    // Create notifications in bulk
    const dataToInsert = targetUsers.map(u => ({
      title,
      message,
      type,
      userId: u.id,
      isRead: false
    }));

    const result = await prisma.notification.createMany({
      data: dataToInsert
    });

    return { success: true, message: `Broadcasted to ${result.count} users.` };
  });
}
