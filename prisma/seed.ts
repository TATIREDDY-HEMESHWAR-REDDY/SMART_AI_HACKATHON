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

  console.log('✅ Seeding complete!');
  console.log('Login credentials:');
  console.log('  STUDENT: student@hvk.edu / password123');
  console.log('  FACULTY: faculty@hvk.edu / password123');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
