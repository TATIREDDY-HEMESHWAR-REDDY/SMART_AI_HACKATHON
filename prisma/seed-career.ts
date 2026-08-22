import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Team 2 Career Data...');
  
  // Seed Skills
  const skills = [
    { name: 'React', category: 'Frontend', description: 'React JS framework' },
    { name: 'Node.js', category: 'Backend', description: 'Node JS runtime' },
    { name: 'Python', category: 'Language', description: 'Python programming' },
    { name: 'Machine Learning', category: 'AI/ML', description: 'ML fundamentals' },
    { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services' },
    { name: 'Docker', category: 'DevOps', description: 'Containerization' },
    { name: 'SQL', category: 'Database', description: 'Structured Query Language' },
    { name: 'Java', category: 'Language', description: 'Java programming' }
  ];
  
  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s
    });
  }

  // Seed Assessments
  const assessments = [
    { title: 'Frontend Developer Readiness', description: 'React JS and UI skills test', type: 'TECHNICAL', durationMinutes: 45 },
    { title: 'Backend Systems Design', description: 'Node JS and Architecture', type: 'TECHNICAL', durationMinutes: 60 },
    { title: 'Data Structures & Algorithms', description: 'Core CS concepts', type: 'TECHNICAL', durationMinutes: 90 },
    { title: 'Machine Learning Basics', description: 'AI and ML fundamentals', type: 'TECHNICAL', durationMinutes: 30 }
  ];
  
  for (const a of assessments) {
    await prisma.careerAssessment.create({
      data: a
    });
  }

  // Assign Mock Skills to Student
  const student = await prisma.studentProfile.findFirst({
    where: { user: { email: 'student@hvk.edu' } }
  });

  if (student) {
    const reactSkill = await prisma.skill.findUnique({ where: { name: 'React' }});
    const pythonSkill = await prisma.skill.findUnique({ where: { name: 'Python' }});

    if (reactSkill) {
        await prisma.studentSkill.upsert({
            where: { studentId_skillId: { studentId: student.id, skillId: reactSkill.id } },
            update: {},
            create: { studentId: student.id, skillId: reactSkill.id, proficiencyLevel: 'INTERMEDIATE' }
        });
    }

    if (pythonSkill) {
        await prisma.studentSkill.upsert({
            where: { studentId_skillId: { studentId: student.id, skillId: pythonSkill.id } },
            update: {},
            create: { studentId: student.id, skillId: pythonSkill.id, proficiencyLevel: 'BEGINNER' }
        });
    }
  }

  console.log('✅ Career Seeding complete!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });