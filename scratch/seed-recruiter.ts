import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const institution = await prisma.institution.findFirst();
  const recruiterRole = await prisma.role.upsert({ where: { name: 'RECRUITER' }, update: {}, create: { name: 'RECRUITER' } });
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'recruiter@hvk.edu' },
    update: {},
    create: {
      email: 'recruiter@hvk.edu',
      passwordHash,
      institution: { connect: { id: institution!.id } },
      roles: { create: { roleId: recruiterRole.id } }
    }
  });
  console.log("✅ Recruiter seeded: recruiter@hvk.edu / password123");
}
main().then(() => prisma.$disconnect());