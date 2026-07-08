const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.$queryRaw`SELECT dept, COUNT(*) as c FROM userperformance WHERE org = 'test org' GROUP BY dept`;
  console.log("UserPerformance depts:", u);
  const s = await prisma.$queryRaw`SELECT dept, COUNT(*) as c FROM stress WHERE org = 'test org' GROUP BY dept`;
  console.log("Stress depts:", s);
}
main().finally(() => prisma.$disconnect());
