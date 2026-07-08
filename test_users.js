const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.pesuser.findMany({ select: { name: true, org: true } });
  console.log("Users:", users);
}
main().finally(() => prisma.$disconnect());
