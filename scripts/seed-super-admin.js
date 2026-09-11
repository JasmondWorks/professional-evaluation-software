// One-off: create or update the platform operator account from env vars.
// Safe to run twice — upserts on email, always re-hashes the current
// SUPER_ADMIN_PASSWORD so rotating it in .env and re-running rotates the login.
//
// Run: npx --yes dotenv-cli -e .env.local -- node scripts/seed-super-admin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SUPER_ADMIN_EMAIL || '').trim();
  const name = (process.env.SUPER_ADMIN_FULLNAME || '').trim();
  const password = (process.env.SUPER_ADMIN_PASSWORD || '').trim();

  if (!email || !name || !password) {
    throw new Error(
      'SUPER_ADMIN_EMAIL, SUPER_ADMIN_FULLNAME and SUPER_ADMIN_PASSWORD must all be set.',
    );
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.pesuser.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hash,
      role: 'super-admin',
      display_role: 'Super Admin',
    },
    update: {
      name,
      password: hash,
      role: 'super-admin',
      display_role: 'Super Admin',
    },
    select: { id: true, email: true, role: true },
  });

  console.log('Super admin ready:', user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
