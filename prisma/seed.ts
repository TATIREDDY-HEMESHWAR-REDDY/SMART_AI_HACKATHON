import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Stage 1...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  // 1. Institution
  const institution = await prisma.institution.upsert({
    where: { code: 'HVK-MAIN' },
    update: {},
    create: { name: 'Hayagriva Vidya Kendram', code: 'HVK-MAIN' },
  });

  // 2. Roles
  const studentRole = await prisma.role.upsert({ where: { name: 'STUDENT' }, update: {}, create: { name: 'STUDENT' } });
  const facultyRole = await prisma.role.upsert({ where: { name: 'FACULTY' }, update: {}, create: { name: 'FACULTY' } });
  const adminRole = await prisma.role.upsert({ where: { name: 'COLLEGE_ADMIN' }, update: {}, create: { name: 'COLLEGE_ADMIN' } });

  // 3. Department & Program
  const cseDept = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      institutionId: institution.id,
      programs: { create: [{ name: 'B.Tech Computer Science' }] }
    },
    include: { programs: true }
  });

  const btechCse = cseDept.programs[0];

  // 4. Demo Faculty User
  const facultyUser = await prisma.user.upsert({
    where: { email: 'faculty@hvk.edu' },
    update: {},
    create: {
      email: 'faculty@hvk.edu',
      passwordHash,
      institutionId: institution.id,
      roles: { create: { roleId: facultyRole.id } },
      facultyProfile: {
        create: {
          employeeId: 'EMP-CSE-001',
          firstName: 'Dr. Ramesh',
          lastName: 'Kumar',
          designation: 'Associate Professor',
          department: cseDept.name
        }
      }
    },
    include: { facultyProfile: true }
  });

  // 5. Demo Student User
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@hvk.edu' },
    update: {},
    create: {
      email: 'student@hvk.edu',
      passwordHash,
      institutionId: institution.id,
      roles: { create: { roleId: studentRole.id } },
      studentProfile: {
        create: {
          firstName: 'Ananya',
          lastName: 'Sharma',
          enrollmentNumber: 'HVK2023CS001',
          programId: btechCse.id,
          currentSemester: 3,
          cgpa: 8.7,
          phone: '+91 98765 43210',
          skills: ['React', 'Node.js', 'Python', 'Machine Learning'],
          certifications: ['AWS Cloud Practitioner', 'Google Data Analytics'],
          projects: ['Smart Campus OS MVP', 'AI Attendance Tracker'],
          internships: ['Summer Analyst @ TechCorp'],
          careerGoal: 'Software Engineer in AI/ML'
        }
      }
    },
    include: { studentProfile: true }
  });

  // 6. Course & Enrollment
  const course = await prisma.course.upsert({
    where: { code: 'CSE3002' },
    update: {},
    create: {
      code: 'CSE3002',
      name: 'Data Structures and Algorithms',
      credits: 4,
      departmentId: cseDept.id,
      facultyId: facultyUser.facultyProfile!.id,
      enrollments: {
        create: { studentId: studentUser.studentProfile!.id }
      },
      sessions: {
        create: [
          { date: new Date(new Date().setHours(9, 0, 0, 0)), topic: 'Graph Theory' },
          { date: new Date(new Date().setDate(new Date().getDate() - 1)), topic: 'Binary Trees' } // Yesterday
        ]
      }
    }
  });

  // Seed Timetable
  await prisma.timetableEntry.create({
    data: {
      dayOfWeek: 1, // Monday
      startTime: '10:00',
      endTime: '11:30',
      roomId: 'Room 304',
      courseId: course.id
    }
  });
  
  await prisma.timetableEntry.create({
    data: {
      dayOfWeek: 3, // Wednesday
      startTime: '10:00',
      endTime: '11:30',
      roomId: 'Room 304',
      courseId: course.id
    }
  });

  // Seed Assignment
  await prisma.assignment.create({
    data: {
      title: 'Project Setup & Architecture',
      description: 'Initialize a basic monorepo with Turborepo.',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      courseId: course.id,
      maxScore: 100
    }
  });

  // Seed Exam & Result
  const exam = await prisma.exam.create({
    data: {
      name: 'Midterm Evaluation',
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      maxMarks: 100,
      courseId: course.id
    }
  });

  await prisma.examResult.create({
    data: {
      marksObtained: 92,
      examId: exam.id,
      studentId: studentUser.studentProfile!.id
    }
  });

  // 7. Demo Admin User (for Complaints & Notifications)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hvk.edu' },
    update: {},
    create: {
      email: 'admin@hvk.edu',
      passwordHash,
      institutionId: institution.id,
      roles: { create: { roleId: adminRole.id } }
    }
  });

  // 8. Seed Dummy Complaint
  await prisma.complaint.create({
    data: {
      title: 'AC Not Working in Room 304',
      description: 'The air conditioner is making a loud noise and not cooling the room during the 10:00 AM class.',
      location: 'Room 304',
      status: 'OPEN',
      authorId: facultyUser.id
    }
  });

  // 9. Seed Dummy Notification
  await prisma.notification.create({
    data: {
      title: 'Welcome to HVK Campus OS!',
      message: 'Please update your profile and check your timetable for the upcoming semester.',
      type: 'SYSTEM',
      userId: studentUser.id
    }
  });

  // 10. TPO Role & User (Placement Modules P-R)
  const tpoRole = await prisma.role.upsert({ where: { name: 'TPO' }, update: {}, create: { name: 'TPO' } });
  await prisma.user.upsert({
    where: { email: 'tpo@hvk.edu' },
    update: {},
    create: {
      email: 'tpo@hvk.edu',
      passwordHash,
      institutionId: institution.id,
      roles: { create: { roleId: tpoRole.id } }
    }
  });

  // 11. Recruiter Role & User (Placement Modules P-R)
  const recruiterRole = await prisma.role.upsert({ where: { name: 'RECRUITER' }, update: {}, create: { name: 'RECRUITER' } });
  await prisma.user.upsert({
    where: { email: 'recruiter@hvk.edu' },
    update: {},
    create: {
      email: 'recruiter@hvk.edu',
      passwordHash,
      institutionId: institution.id,
      roles: { create: { roleId: recruiterRole.id } }
    }
  });

  // 12. Alumni Role (Alumni Modules)
  const alumniRole = await prisma.role.upsert({ where: { name: 'ALUMNI' }, update: {}, create: { name: 'ALUMNI' } });

  console.log('✅ Seeding complete!');
  console.log('Login credentials:');
  console.log('  STUDENT:   student@hvk.edu / password123');
  console.log('  FACULTY:   faculty@hvk.edu / password123');
  console.log('  ADMIN:     admin@hvk.edu / password123');
  console.log('  TPO:       tpo@hvk.edu / password123');
  console.log('  RECRUITER: recruiter@hvk.edu / password123');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
