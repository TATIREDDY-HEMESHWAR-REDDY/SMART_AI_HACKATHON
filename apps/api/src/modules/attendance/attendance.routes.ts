import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { markAttendanceSchema } from './attendance.schema';
import { ApiSuccessResponse } from '@campus-os/types';

const prisma = new PrismaClient();

export default async function attendanceRoutes(server: FastifyInstance) {
  
  // Get all courses for a faculty (for the faculty dashboard)
  server.get('/courses', { preValidation: [server.requireRole(['FACULTY', 'STUDENT'])] }, async (request, reply) => {
    const user = request.user;
    
    let courses;
    if (user.roles.includes('FACULTY')) {
      const profile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
      courses = await prisma.course.findMany({
        where: { facultyId: profile?.id },
        include: { sessions: { orderBy: { date: 'desc' } } }
      });
    } else {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: profile?.id },
        include: { course: { include: { sessions: { orderBy: { date: 'desc' } } } } }
      });
      courses = enrollments.map(e => e.course);
    }

    return { success: true, data: courses };
  });

  // Get roster and existing attendance for a specific session
  server.get('/sessions/:sessionId', { preValidation: [server.requireRole(['FACULTY'])] }, async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };

    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                student: true
              }
            }
          }
        },
        records: true
      }
    });

    if (!session) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
    }

    // Map enrollments to roster, injecting existing attendance if present
    const roster = session.course.enrollments.map(enrollment => {
      const existingRecord = session.records.find(r => r.studentId === enrollment.studentId);
      return {
        student: enrollment.student,
        record: existingRecord || null
      };
    });

    return { success: true, data: { session, roster } };
  });

  // Save attendance for a session
  server.post('/sessions/:sessionId/mark', { preValidation: [server.requireRole(['FACULTY'])] }, async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const parsed = markAttendanceSchema.safeParse(request.body);
    
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid attendance data' }
      });
    }

    // Use Prisma transaction to upsert all records
    const transaction = parsed.data.records.map(record => 
      prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: sessionId,
            studentId: record.studentId
          }
        },
        update: {
          status: record.status,
          remarks: record.remarks
        },
        create: {
          sessionId,
          studentId: record.studentId,
          status: record.status,
          remarks: record.remarks
        }
      })
    );

    const savedRecords = await prisma.$transaction(transaction);

    return { success: true, data: savedRecords };
  });

}
