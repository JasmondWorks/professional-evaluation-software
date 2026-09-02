/**
 * Promote an account to the platform tier.
 *
 *   npx tsx scripts/promote-super-admin.ts <email>                  # local
 *   npx dotenv-cli -e .env.production.local -- \
 *     npx tsx scripts/promote-super-admin.ts <email>                # production
 *
 * Why this exists: `super-admin` and `admin` are different tiers.
 * `admin` is an ORGANIZATION admin, confined to one tenant; `super-admin` is the
 * platform operator and is the only tier the cross-organization console views
 * answer to (app/api/admin/_scope.ts). No account currently holds it, so
 * /admin/organizations and /admin/auditor have nothing to show. Promoting one
 * account here lights them up — no code change, no redeploy.
 *
 * It is deliberately not a route: granting the tier that reads every tenant's
 * data should not be reachable over HTTP.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error('Usage: npx tsx scripts/promote-super-admin.ts <email>');
    process.exit(1);
  }

  const user = await prisma.pesuser.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, org: true },
  });

  if (!user) {
    console.error(`No account with the email ${email}.`);
    process.exit(1);
  }

  if (user.role === 'super-admin') {
    console.log(`${user.name} <${user.email}> is already super-admin. Nothing to do.`);
    return;
  }

  console.log(
    `Promoting ${user.name} <${user.email}> from ${user.role ?? '(no role)'} ` +
      `to super-admin. They will be able to read every organization's data.`,
  );

  await prisma.pesuser.update({
    where: { id: user.id },
    data: { role: 'super-admin' },
  });

  // The role is a claim on the token, so an existing session keeps the old one
  // until it expires (15 minutes) or the user signs in again.
  console.log('Done. Sign out and back in for the new role to reach the token.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
