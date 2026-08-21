import { PrismaClient } from '@prisma/client';

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

  // TODO: Add demo roles, demo users (Student, Faculty, Admin), and programs.
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
