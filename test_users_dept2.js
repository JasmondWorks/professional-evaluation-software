const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.userperformance.findMany({ where: { org: 'test org', dept: 'Computer Science' }, select: { pesuser_name: true } });
  console.log("UserPerformance entries for CS:", u.map(x => x.pesuser_name));
}
main().finally(() => prisma.$disconnect());
