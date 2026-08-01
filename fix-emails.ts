import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.pesuser.findMany();
  let fixedCount = 0;
  for (const user of users) {
    if (user.email !== user.email.trim()) {
      await prisma.pesuser.update({
        where: { id: user.id },
        data: { email: user.email.trim() }
      });
      fixedCount++;
      console.log(`Fixed whitespace in email: "${user.email}" -> "${user.email.trim()}"`);
    }
  }
  console.log(`Finished. Fixed ${fixedCount} users.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
