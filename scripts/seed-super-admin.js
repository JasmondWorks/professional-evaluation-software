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

  // A platform operator belongs to no single organization or department —
  // explicitly nulled (not just omitted) so re-running this after someone
  // else has edited the row in Neon/Studio always clears it back out.
  const noOrgFields = {
    org: null,
    dept: null,
    faculty_college: null,
    address: null,
    gsm: null,
    dob: null,
    doa: null,
    poa: null,
    doc: null,
    post: null,
    dopp: null,
    level: null,
    management_level: null,
    category: null,
    plan: null,
  };

  const user = await prisma.pesuser.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hash,
      role: 'super-admin',
      display_role: 'Super Admin',
      ...noOrgFields,
    },
    update: {
      name,
      password: hash,
      role: 'super-admin',
      display_role: 'Super Admin',
      ...noOrgFields,
    },
    select: { id: true, email: true, role: true, org: true },
  });

  console.log('Super admin ready:', user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
