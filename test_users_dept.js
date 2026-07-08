const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const s = await prisma.stress.findMany({ where: { org: 'test org' }, select: { dept: true, pesuser_name: true } });
  console.log("Stress entries:", s.filter(x => x.dept !== 'Music department'));
}
main().finally(() => prisma.$disconnect());
