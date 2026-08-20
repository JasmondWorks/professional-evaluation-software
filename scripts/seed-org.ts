/**
 * Seeds a paid organization and its admin, standing in for the WordPress and
 * PayPal checkout that is not reachable from here.
 *
 *   npx tsx scripts/seed-org.ts                 # local, both orgs
 *   npx tsx scripts/seed-org.ts --only=company
 *   DATABASE_URL=<neon> npx tsx scripts/seed-org.ts
 *
 * Each run writes an org, an admin user, the preset roles and a subscription
 * record marked paid for a year. The subscription reference is prefixed SEED_
 * so these rows stay distinguishable from real PayPal ones.
 *
 * Re-running replaces the org cleanly rather than colliding on the unique name.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { findPlan, normalizeInstitution, normalizePlan } from '../app/lib/billing/catalog';
import { addInterval } from '../app/lib/billing/verify';

const prisma = new PrismaClient();

type Spec = {
  key: string;
  org: string;
  category: 'company' | 'public';
  plan: 'basic' | 'standard' | 'premium';
  adminName: string;
  email: string;
};

const SPECS: Spec[] = [
  {
    key: 'company',
    org: 'Olipii Limited',
    category: 'company',
    // Premium so every model the client may want to look at is reachable.
    plan: 'premium',
    adminName: 'Olipii Administrator',
    email: 'company@olipii.com',
  },
  {
    key: 'public',
    org: 'Olipii Public Service',
    category: 'public',
    plan: 'premium',
    adminName: 'Olipii Public Administrator',
    email: 'public@olipii.com',
  },
];

/** Readable but not guessable: three groups of five, plus the classes most
 *  password rules insist on. */
function generatePassword() {
  const body = randomBytes(9).toString('base64url').replace(/[-_]/g, 'x');
  return `Pes-${body}-9`;
}

/** An explicit password wins over a generated one, so the same credentials can
 *  be reproduced on another database. Needed when the details have already been
 *  handed to someone and cannot be withdrawn.
 *
 *      PES_SEED_PASSWORD_COMPANY=... PES_SEED_PASSWORD_PUBLIC=... npx tsx scripts/seed-org.ts
 */
function passwordFor(key: string) {
  const supplied = process.env[`PES_SEED_PASSWORD_${key.toUpperCase()}`];
  return supplied && supplied.trim() ? supplied.trim() : generatePassword();
}

async function seed(spec: Spec) {
  const institution = normalizeInstitution(spec.category)!;
  const planName = normalizePlan(spec.plan)!;
  const plan = findPlan(institution, planName);
  if (!plan) throw new Error(`No ${spec.plan} plan for ${spec.category}`);

  // Remove any previous run. org.name is globally unique and 37 tables key off
  // it by name, so the user rows must go with it or they would be orphaned.
  await prisma.pesuser.deleteMany({ where: { org: spec.org } });
  await prisma.subscriptions_info.deleteMany({ where: { org: spec.org } });
  await prisma.org.deleteMany({ where: { name: spec.org } });

  await prisma.org.create({
    data: {
      name: spec.org,
      category: spec.category,
      plan: spec.plan,
      // maintenance_model is an academic concept; false for both of these.
      maintenance_model: false,
      evaluation: [],
    },
  });

  const password = passwordFor(spec.key);
  await prisma.pesuser.create({
    data: {
      name: spec.adminName,
      email: spec.email,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
      org: spec.org,
      category: spec.category,
      plan: spec.plan,
    },
  });

  const paidAt = new Date();
  await prisma.subscriptions_info.create({
    data: {
      pesuser_email: spec.email,
      pesuser_name: spec.adminName,
      org: spec.org,
      plan_code: planName,
      plan_name: spec.plan,
      reference: `SEED_${spec.key}_${randomBytes(6).toString('hex')}`,
      status: 'success',
      amount: plan.price / 100,
      paid_at: paidAt,
      expires_at: addInterval(paidAt, plan.interval, plan.intervalCount),
    },
  });

  // Same preset roles a real signup would create, so the org can add staff.
  const { seedPresetRoles } = await import('../app/api/_lib/seedRoles');
  await seedPresetRoles(spec.org);

  return { ...spec, password, expiresAt: addInterval(paidAt, plan.interval, plan.intervalCount) };
}

async function main() {
  const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];
  const specs = only ? SPECS.filter((s) => s.key === only) : SPECS;
  if (specs.length === 0) throw new Error(`No spec matches --only=${only}`);

  const target = (process.env.DATABASE_URL ?? '').includes('neon.tech') ? 'Neon' : 'local';
  const results = [];
  for (const spec of specs) results.push(await seed(spec));

  console.log(`\nSeeded ${results.length} organization(s) on the ${target} database.\n`);
  for (const r of results) {
    console.log(`  ${r.org}`);
    console.log(`    Institution type  ${r.category}`);
    console.log(`    Plan              ${r.plan}`);
    console.log(`    Email             ${r.email}`);
    console.log(`    Password          ${r.password}`);
    console.log(`    Subscription ends ${r.expiresAt.toDateString()}\n`);
  }
  console.log('These are printed here only; the script does not email them.');
  console.log('To send them, use sendMail() from app/lib/email.ts.\n');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
