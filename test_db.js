const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const org = 'test org';
  const a = await prisma.appraisal.findMany({ where: { org }, select: { dept: true, pesuser_name: true } });
  console.log("Appraisal count:", a.length);
  const u = await prisma.userperformance.findMany({ where: { org }, select: { dept: true, pesuser_name: true } });
  console.log("UserPerformance count:", u.length);
  const s = await prisma.stress.findMany({ where: { org }, select: { dept: true, pesuser_name: true } });
  console.log("Stress count:", s.length);
  
  // let's see which depts have only 1 entry in the frontend vs backend
}
main().finally(() => prisma.$disconnect());
