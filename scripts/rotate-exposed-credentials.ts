/**
 * Rotate every credential that `backup.sql` exposed.
 *
 *   npx tsx scripts/rotate-exposed-credentials.ts --dry-run          # report only
 *   npx tsx scripts/rotate-exposed-credentials.ts                    # local
 *   npx dotenv-cli -e .env.production.local -- \
 *     npx tsx scripts/rotate-exposed-credentials.ts                  # production
 *
 * `backup.sql` was tracked in Git from 9 May 2026 until 2 Sep 2026. It is a
 * pg_dump carrying COPY data for pesuser and ~25 other tables: 24 staff rows,
 * 22 email addresses, 2 bcrypt hashes, and at least one password stored in
 * plain text. Anyone who cloned the repository in that window has all of it, and
 * rewriting the history does not un-disclose what was already taken. So the
 * passwords have to be treated as burned.
 *
 * What this does, in order:
 *
 *  1. Any row whose password is NOT a bcrypt hash is plaintext. Those are the
 *     live credentials in the dump — /api/login still accepts a plaintext match
 *     (it re-hashes on success), so `password123` works today. Each gets a fresh
 *     random password, hashed.
 *  2. Any row whose bcrypt hash appears in the dump is rotated too: the hash is
 *     public, and bcrypt only buys time against an offline attack, it does not
 *     stop one.
 *
 * It prints the new passwords once, to stdout, and never stores them anywhere
 * else. Capture that output and distribute it — or run resendCredentials from
 * the admin UI afterwards, which mails each person a fresh one.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

// The bcrypt hashes that appear in the committed dump. A hash being public is
// not the same as a password being public, but it is a head start no attacker
// should be given, and these accounts are few.
const EXPOSED_HASHES = [
  '$2b$10$tBv2jeSAewTSWTnm3gopu.xmDF7xdoVXT8GfZFCBl.El6aDIoqFT6',
];

const BCRYPT_PREFIXES = ['$2a$', '$2b$', '$2y$'];

const isBcrypt = (value: string | null | undefined) =>
  !!value && BCRYPT_PREFIXES.some((p) => value.startsWith(p));

/** Readable, unambiguous, and long enough not to be guessed. */
function newPassword(length = 16): string {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length];
  return out;
}

async function main() {
  const users = await prisma.pesuser.findMany({
    select: { id: true, name: true, email: true, password: true, org: true },
    orderBy: { id: 'asc' },
  });

  const plaintext = users.filter((u) => !isBcrypt(u.password));
  const exposed = users.filter(
    (u) => isBcrypt(u.password) && EXPOSED_HASHES.includes(u.password),
  );
  const targets = [...plaintext, ...exposed];

  console.log(`${users.length} accounts.`);
  console.log(`  ${plaintext.length} holding a plaintext password (live credentials in the dump)`);
  console.log(`  ${exposed.length} whose bcrypt hash is published in the dump`);
  console.log(`  ${targets.length} to rotate\n`);

  if (targets.length === 0) {
    console.log('Nothing to rotate.');
    return;
  }

  if (DRY_RUN) {
    for (const u of targets) {
      console.log(`  would rotate: ${u.email}  (${u.org ?? 'no org'})`);
    }
    console.log('\nDry run: nothing was written.');
    return;
  }

  console.log('New passwords — shown once, not stored anywhere else:\n');

  for (const u of targets) {
    const password = newPassword();
    await prisma.pesuser.update({
      where: { id: u.id },
      data: { password: await bcrypt.hash(password, 10) },
    });
    console.log(`  ${u.email.padEnd(40)} ${password}`);
  }

  console.log(`\nRotated ${targets.length} accounts.`);
  console.log(
    'Distribute these, or use Resend Credentials in the admin UI to mail fresh ones.',
  );
  console.log(
    '\nStill to do by hand: rotate JWT_SECRET and REFRESH_TOKEN_SECRET in the\n' +
      'Vercel project settings and in .env.production.local. Doing so invalidates\n' +
      'every issued token, which signs everyone out once — that is the point.',
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
