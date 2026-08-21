import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create Demo Institution
  const institution = await prisma.institution.upsert({
    where: { code: 'VIT-C' },
    update: {},
    create: {
      name: 'VIT-Style Institute, Chennai Campus',
      code: 'VIT-C',
    },
  });
  console.log('Created Institution:', institution.name);

  // Create Roles
  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: {},
    create: { name: 'STUDENT', description: 'Student Access' }
  });

  const facultyRole = await prisma.role.upsert({
    where: { name: 'FACULTY' },
    update: {},
    create: { name: 'FACULTY', description: 'Faculty Access' }
  });

  // Create Demo Student User
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@campus.os' },
    update: {},
    create: {
      email: 'student@campus.os',
      passwordHash,
      institutionId: institution.id,
      roles: {
        create: { roleId: studentRole.id }
      },
      studentProfile: {
        create: {
          enrollmentNumber: '21BCE0001',
          firstName: 'Ananya',
          lastName: 'Sharma',
          currentSemester: 5,
          cgpa: 8.6,
          program: {
            create: {
              name: 'B.Tech Computer Science',
              department: {
                create: {
                  name: 'Computer Science and Engineering',
                  institutionId: institution.id
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('Created Demo Student: student@campus.os / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
