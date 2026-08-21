import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const gradeSchema = z.object({
  marksObtained: z.number().min(0)
});

export default async function academicsRoutes(server: FastifyInstance) {
  
  // GET /api/v1/academics/timetable
  server.get('/timetable', { preValidation: [server.requireAuth] }, async (request, reply) => {
    // If student, return their enrolled courses' timetable
    if (request.user.roles.includes('STUDENT')) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: request.user.id },
        include: { enrollments: true }
      });
      if (!studentProfile) return reply.status(404).send({ success: false, message: 'Student profile not found' });
      
      const courseIds = studentProfile.enrollments.map((e: any) => e.courseId);
      const timetable = await prisma.timetableEntry.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: true }
      });
      return { success: true, data: timetable };
    }

    // If faculty, return their assigned courses' timetable
    if (request.user.roles.includes('FACULTY')) {
      const facultyProfile = await prisma.facultyProfile.findUnique({
        where: { userId: request.user.id }
      });
      if (!facultyProfile) return reply.status(404).send({ success: false, message: 'Faculty profile not found' });
      
      const timetable = await prisma.timetableEntry.findMany({
        where: { course: { facultyId: facultyProfile.id } },
        include: { course: true }
      });
      return { success: true, data: timetable };
    }

    return reply.status(403).send({ success: false, message: 'No timetable access for this role' });
  });

  // GET /api/v1/academics/courses
  server.get('/courses', { preValidation: [server.requireAuth] }, async (request, reply) => {
    if (request.user.roles.includes('STUDENT')) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: request.user.id }
      });
      if (!profile) return reply.status(404).send({ success: false, message: 'Profile not found' });

      const courses = await prisma.course.findMany({
        where: { enrollments: { some: { studentId: profile.id } } },
        include: { 
          assignments: true, 
          exams: {
            include: {
              results: { where: { studentId: profile.id } }
            }
          },
          faculty: true
        }
      });
      return { success: true, data: courses };
    }

    if (request.user.roles.includes('FACULTY')) {
      const profile = await prisma.facultyProfile.findUnique({
        where: { userId: request.user.id }
      });
      if (!profile) return reply.status(404).send({ success: false, message: 'Profile not found' });

      const courses = await prisma.course.findMany({
        where: { facultyId: profile.id },
        include: { 
          assignments: true, 
          exams: { include: { results: { include: { student: { include: { user: true } } } } } },
          enrollments: { include: { student: { include: { user: true } } } }
        }
      });
      return { success: true, data: courses };
    }

    return reply.status(403).send({ success: false, message: 'No course access' });
  });

  // POST /api/v1/academics/exams/:examId/students/:studentId/marks
  server.post('/exams/:examId/students/:studentId/marks', { preValidation: [server.requireRole(['FACULTY'])] }, async (request, reply) => {
    const { examId, studentId } = request.params as { examId: string, studentId: string };
    const parsed = gradeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: parsed.error });
    }

    // Verify Faculty owns the course
    const profile = await prisma.facultyProfile.findUnique({ where: { userId: request.user.id } });
    const exam = await prisma.exam.findUnique({ 
      where: { id: examId }, 
      include: { course: { include: { enrollments: true } } } 
    });
    
    if (!exam || exam.course.facultyId !== profile?.id) {
      return reply.status(403).send({ success: false, message: 'Not authorized to grade this exam' });
    }

    // EDGE CASE: Ensure student is actually enrolled in the course
    const isEnrolled = exam.course.enrollments.some(e => e.studentId === studentId);
    if (!isEnrolled) {
      return reply.status(400).send({ success: false, message: 'Student is not enrolled in this course' });
    }

    // EDGE CASE: Ensure marks do not exceed the max possible score
    if (parsed.data.marksObtained > exam.maxMarks) {
      return reply.status(400).send({ success: false, message: `Marks cannot exceed maximum score of ${exam.maxMarks}` });
    }

    const result = await prisma.examResult.upsert({
      where: { examId_studentId: { examId, studentId } },
      update: { marksObtained: parsed.data.marksObtained },
      create: { examId, studentId, marksObtained: parsed.data.marksObtained }
    });

    return { success: true, data: result, message: 'Grade saved' };
  });

  const assignmentSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string(),
    maxScore: z.number().min(1)
  });

  // POST /api/v1/academics/courses/:courseId/assignments
  server.post('/courses/:courseId/assignments', { preValidation: [server.requireRole(['FACULTY'])] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const parsed = assignmentSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, message: 'Invalid assignment data' });
    
    const { title, description, dueDate, maxScore } = parsed.data;

    const profile = await prisma.facultyProfile.findUnique({ where: { userId: request.user.id } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.facultyId !== profile?.id) return reply.status(403).send({ success: false, message: 'Not authorized' });

    const assignment = await prisma.assignment.create({
      data: { title, description, dueDate: new Date(dueDate), maxScore, courseId }
    });
    return { success: true, data: assignment };
  });

  const examSchema = z.object({
    name: z.string().min(1),
    date: z.string(),
    maxMarks: z.number().min(1)
  });

  // POST /api/v1/academics/courses/:courseId/exams
  server.post('/courses/:courseId/exams', { preValidation: [server.requireRole(['FACULTY'])] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const parsed = examSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, message: 'Invalid exam data' });

    const { name, date, maxMarks } = parsed.data;

    const profile = await prisma.facultyProfile.findUnique({ where: { userId: request.user.id } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.facultyId !== profile?.id) return reply.status(403).send({ success: false, message: 'Not authorized' });

    const exam = await prisma.exam.create({
      data: { name, date: new Date(date), maxMarks, courseId }
    });
    return { success: true, data: exam };
  });
}
