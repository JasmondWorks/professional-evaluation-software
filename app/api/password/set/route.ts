/** Choose a password from a set-password or reset link.
 *
 *  GET  ?token=…  tells the page whether the link is still good, and who for.
 *  POST { token, password }  spends it.
 *
 *  Public by necessity — the holder has no session yet. The token is the
 *  credential, which is why it is single-use, expiring, and stored hashed.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/app/api/_lib/rateLimit';
import {
  consumePasswordToken,
  findPasswordTokenHolder,
} from '@/app/lib/auth/passwordToken';

/** Long enough to be worth having, short enough not to be a fight. Matches the
 *  minimum the signup form used to apply. */
const MIN_LENGTH = 8;

export async function GET(req: Request) {
  // A token is 64 hex characters; guessing one is not feasible, but rate
  // limiting keeps this from being a way to test a stolen list quickly.
  const tooMany = rateLimit(req, { key: 'password-token-check', limit: 30, windowMs: 15 * 60_000 });
  if (tooMany) return tooMany;

  const token = new URL(req.url).searchParams.get('token') ?? '';
  const holder = await findPasswordTokenHolder(token);

  if (!holder) {
    return NextResponse.json(
      { ok: false, error: 'This link has expired or has already been used.' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    purpose: holder.purpose,
    name: holder.name,
    email: holder.email,
    organization: holder.org,
  });
}

export async function POST(req: Request) {
  const tooMany = rateLimit(req, { key: 'password-set', limit: 20, windowMs: 15 * 60_000 });
  if (tooMany) return tooMany;

  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (password.length < MIN_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `Your password must be at least ${MIN_LENGTH} characters.` },
      { status: 400 },
    );
  }

  // Re-checked here rather than trusting the GET: the link may have expired, or
  // been used in another tab, between loading the page and submitting it.
  const holder = await findPasswordTokenHolder(token);
  if (!holder) {
    return NextResponse.json(
      { ok: false, error: 'This link has expired or has already been used.' },
      { status: 404 },
    );
  }

  const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
  await consumePasswordToken(holder.id, hashed);

  return NextResponse.json({ ok: true, email: holder.email });
}
