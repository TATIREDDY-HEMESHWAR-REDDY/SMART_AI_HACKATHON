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
      if (!profile) return reply.status(404).send({ success: false, message: 'Faculty profile not found' });
      courses = await prisma.course.findMany({
        where: { facultyId: profile.id },
        include: { sessions: { orderBy: { date: 'desc' } } }
      });
    } else {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!profile) return reply.status(404).send({ success: false, message: 'Student profile not found' });
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: profile.id },
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

  // Get overall course stats
  server.get('/course/:courseId', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sessions: { include: { records: true } },
        enrollments: true
      }
    });

    if (!course) return reply.status(404).send({ success: false, message: 'Course not found' });

    return { success: true, data: course };
  });

  // Get student attendance stats
  server.get('/student/:id', { preValidation: [server.requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // PRIVACY FIX: Block students from seeing other students' attendance
    if (request.user.id !== id && !request.user.roles.some((r: string) => ['COLLEGE_ADMIN', 'ADMIN', 'FACULTY'].includes(r))) {
      return reply.status(403).send({ success: false, message: 'Forbidden' });
    }

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: id } });
    if (!studentProfile) return reply.status(404).send({ success: false, message: 'Profile not found' });

    // Calculate stats per course
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: studentProfile.id },
      include: {
        course: {
          include: { sessions: true }
        }
      }
    });

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: studentProfile.id },
      include: { session: true }
    });

    const stats = enrollments.map(enrollment => {
      const courseSessions = enrollment.course.sessions.length;
      const presentRecords = records.filter(r => r.session.courseId === enrollment.courseId && r.status === 'PRESENT').length;
      const percentage = courseSessions === 0 ? 100 : (presentRecords / courseSessions) * 100;
      
      return {
        courseId: enrollment.courseId,
        courseName: enrollment.course.name,
        courseCode: enrollment.course.code,
        totalSessions: courseSessions,
        presentCount: presentRecords,
        percentage: percentage,
        lowAttendanceAlert: percentage < 75
      };
    });

    return { success: true, data: stats };
  });

  // Save attendance for a session (Faculty)
  server.post('/sessions/:sessionId/mark', { preValidation: [server.requireRole(['FACULTY'])] }, async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const parsed = markAttendanceSchema.safeParse(request.body);
    
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid attendance data' }
      });
    }

    // EDGE CASE FIX: Verify Faculty owns this session's course
    const profile = await prisma.facultyProfile.findUnique({ where: { userId: request.user.id } });
    const session = await prisma.classSession.findUnique({ where: { id: sessionId }, include: { course: true } });
    
    if (!session) return reply.status(404).send({ success: false, message: 'Session not found' });
    if (session.course.facultyId !== profile?.id) {
      return reply.status(403).send({ success: false, message: 'Not authorized. You do not teach this course.' });
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

    return { success: true, data: savedRecords, message: 'Attendance marked successfully' };
  });

  // Biometric Mock (Student self-marking for a session, mocking geofence/QR)
  server.post('/sessions/:sessionId/biometric-mock', { preValidation: [server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const profile = await prisma.studentProfile.findUnique({ where: { userId: request.user.id } });
    if (!profile) return reply.status(404).send({ success: false, message: 'Profile not found' });

    // EDGE CASE FIX: Ensure student is actually enrolled in this course!
    const session = await prisma.classSession.findUnique({ where: { id: sessionId }, include: { course: { include: { enrollments: true } } } });
    if (!session) return reply.status(404).send({ success: false, message: 'Session not found' });

    const isEnrolled = session.course.enrollments.some(e => e.studentId === profile.id);
    if (!isEnrolled) return reply.status(403).send({ success: false, message: 'Cannot mark attendance for a course you are not enrolled in.' });

    // EDGE CASE FIX: Ensure students can only mark attendance on the actual day of the session
    const sessionDate = new Date(session.date).toDateString();
    const today = new Date().toDateString();
    if (sessionDate !== today) {
      return reply.status(400).send({ success: false, message: 'Biometric verification is only allowed on the exact day of the session.' });
    }

    // Mark present
    const record = await prisma.attendanceRecord.upsert({
      where: { sessionId_studentId: { sessionId, studentId: profile.id } },
      update: { status: 'PRESENT', remarks: 'Biometric Verified' },
      create: { sessionId, studentId: profile.id, status: 'PRESENT', remarks: 'Biometric Verified' }
    });

    return { success: true, data: record, message: 'Biometric attendance marked successfully!' };
  });
}
