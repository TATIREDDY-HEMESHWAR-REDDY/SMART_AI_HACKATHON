import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const institution = await prisma.institution.findFirst();
  const tpoRole = await prisma.role.upsert({ where: { name: 'TPO' }, update: {}, create: { name: 'TPO' } });
  
  if (!tpoRole || !institution) {
    console.log("Missing prerequisites");
    return;
  }
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'tpo@hvk.edu' },
    update: {},
    create: {
      email: 'tpo@hvk.edu',
      passwordHash,
      institution: { connect: { id: institution.id } },
      roles: { create: { roleId: tpoRole.id } }
    }
  });

  console.log("✅ TPO seeded: tpo@hvk.edu / password123");
}
main().then(() => prisma.$disconnect());