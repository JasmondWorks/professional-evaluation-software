const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const q = await prisma.$queryRaw`SELECT dept, COUNT(*) as c FROM appraisal WHERE org = 'test org' GROUP BY dept`;
  console.log("Appraisal depts:", q);
}
main().finally(() => prisma.$disconnect());
