// Rate limiting for the routes where an attacker learns something from each
// attempt: the credential endpoints.
//
// A note on what this is and is not. It counts in the process's own memory, so
// on Vercel each serverless instance keeps its own tally and a burst spread
// across instances gets more attempts than the number below suggests. That is a
// real limitation and the reason to move this to Redis or the database when
// there is somewhere shared to put it. It is still worth having: the attack it
// blocks — thousands of guesses down one connection — is exactly the one a
// single instance sees all of, and the previous count was unlimited.
//
//   const limited = rateLimit(req, { key: 'login', limit: 10, windowMs: 60_000 });
//   if (limited) return limited;

import { NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bound the map so a flood of distinct addresses cannot grow it without limit.
const MAX_BUCKETS = 10_000;

function sweep(now: number) {
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

/** The caller's address, as far as the proxy in front of us reports it. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export type RateLimitRule = {
  /** Distinguishes one route's counter from another's. */
  key: string;
  /** Attempts allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Extra discriminator — an email address, say — so one address being
   *  attacked does not lock out everyone behind the same NAT. */
  subject?: string | null;
};

/**
 * Returns a 429 response when the caller is over the limit, or null to proceed.
 */
export function rateLimit(req: Request, rule: RateLimitRule): NextResponse | null {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) sweep(now);

  const id = `${rule.key}:${clientIp(req)}:${rule.subject ?? ''}`;
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + rule.windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= rule.limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return NextResponse.json(
    { error: 'Too many attempts. Try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}
