const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`SELECT setval('appraisal_id_seq', (SELECT COALESCE(MAX(id), 1) FROM appraisal))`);
  await prisma.$executeRawUnsafe(`SELECT setval('userperformance_id_seq', (SELECT COALESCE(MAX(id), 1) FROM userperformance))`);
  await prisma.$executeRawUnsafe(`SELECT setval('stress_id_seq', (SELECT COALESCE(MAX(id), 1) FROM stress))`);
  console.log("Sequences fixed");
}
main().finally(() => prisma.$disconnect());
