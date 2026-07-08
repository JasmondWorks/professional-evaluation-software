const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const roles = await prisma.roles.findMany({ where: { org: 'test org' } });
  console.log("Roles for test org:", roles);
}
main().finally(() => prisma.$disconnect());
