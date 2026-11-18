/** Set-password and reset-password tokens. SERVER ONLY.
 *
 *  One mechanism for two flows that differ only in wording and lifetime:
 *
 *    setup — a new account provisioned from a storefront payment. No password
 *            is ever emailed; the link is how they choose their first one.
 *    reset — the ordinary "I forgot my password".
 *
 *  Three properties the previous reset flow did not have:
 *
 *    1. The stored value is a SHA-256 hash, never the token. A leaked backup or
 *       query log would otherwise be a takeover of every account with one
 *       outstanding.
 *    2. Single use. Setting a password clears the token, so a link sitting in a
 *       forwarded email stops being a key.
 *    3. Lookup is by hash and expiry together, and the row is cleared on use,
 *       so an expired token cannot be spent.
 */

import crypto from 'crypto';
import prisma from '@/app/api/prisma.dev';

export type TokenPurpose = 'setup' | 'reset';

/** Setup links are forwarded — the buyer is often not the administrator — and
 *  may arrive while someone is away, so a week. Reset links are requested by
 *  the person sitting at the screen, but an hour (what this used to be) is
 *  aggressive once email delivery and a human noticing are included. */
const LIFETIME_MS: Record<TokenPurpose, number> = {
  setup: 7 * 24 * 60 * 60 * 1000,
  reset: 24 * 60 * 60 * 1000,
};

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Issue a token for this user, replacing any outstanding one. Returns the
 *  plaintext, which exists only in this function's return value and the email
 *  built from it — it is never stored and cannot be recovered afterwards. */
export async function issuePasswordToken(
  userId: string,
  purpose: TokenPurpose,
): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + LIFETIME_MS[purpose]);

  await prisma.pesuser.update({
    where: { id: userId },
    data: {
      password_token: hashToken(token),
      password_token_expiry: expiresAt,
      password_token_purpose: purpose,
    },
  });

  return { token, expiresAt };
}

export type TokenHolder = {
  id: string;
  name: string | null;
  email: string;
  org: string | null;
  purpose: TokenPurpose;
};

/** The account a token belongs to, or null if it is unknown, spent or expired.
 *  One answer for all three: which of them it was is not something the caller
 *  should be able to learn. */
export async function findPasswordTokenHolder(token: string): Promise<TokenHolder | null> {
  if (!token || token.length < 32) return null;

  const user = await prisma.pesuser.findFirst({
    where: {
      password_token: hashToken(token),
      password_token_expiry: { gt: new Date() },
    },
    select: {
      id: true,
      name: true,
      email: true,
      org_id: true,
      password_token_purpose: true,
    },
  });
  if (!user) return null;

  const org = user.org_id
    ? await prisma.org.findUnique({ where: { id: user.org_id }, select: { name: true } })
    : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    org: org?.name ?? null,
    purpose: (user.password_token_purpose as TokenPurpose) ?? 'reset',
  };
}

/** Spend the token and set the password. Clears must_change_password: they have
 *  just chosen this one themselves, so there is nothing to force. */
export async function consumePasswordToken(
  userId: string,
  hashedPassword: string,
): Promise<void> {
  await prisma.pesuser.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      password_token: null,
      password_token_expiry: null,
      password_token_purpose: null,
      must_change_password: false,
      // The legacy columns are cleared too, so an old outstanding reset link
      // cannot be used after a password has been set through the new flow.
      resettoken: null,
      resettokenexpiry: null,
    },
  });
}

/** The origins this deployment may send people to.
 *
 *  APP_ORIGINS (comma-separated) when several are legitimate — a custom domain
 *  plus a preview deployment — otherwise NEXT_PUBLIC_APP_URL alone. */
function allowedOrigins(): string[] {
  const raw = process.env.APP_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || '';
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/** The link that goes in the email.
 *
 *  The host here is security-sensitive, because the URL carries a live
 *  single-use credential. /api/password/request and /api/resetPassword are
 *  public — anyone may ask for a reset on anyone's address — so an attacker who
 *  can choose the host chooses where the victim's token is delivered. Sending
 *  `Origin: https://evil.example` would have mailed the real account holder a
 *  genuine link pointing at the attacker, and clicking it hands over the token.
 *  That is password reset poisoning, and an earlier revision of this function
 *  was open to it: it accepted any origin whose protocol was http or https.
 *
 *  So `origin` is now a selector, not a source. It is honoured only when it
 *  exactly matches a configured origin, which lets a multi-domain deployment
 *  send people back to the domain they arrived on and gives an attacker
 *  nothing to inject. Anything unrecognised falls back to the first configured
 *  origin.
 *
 *  With nothing configured at all: a deployment fails closed rather than mail
 *  a link nobody can use, and local development falls back to localhost.
 *  NEXT_PUBLIC_APP_URL being empty is how this function previously produced
 *  the bare path `/set-password?token=…`, which mail clients autolink into
 *  `http://set-password/?token=…` — a link with the path as its hostname. */
export function passwordLink(
  token: string,
  purpose: TokenPurpose,
  origin?: string | null,
): string {
  const path = purpose === 'setup' ? '/set-password' : '/reset-password';
  const allowed = allowedOrigins();

  let base = '';
  if (origin) {
    try {
      const candidate = new URL(origin).origin;
      if (allowed.includes(candidate)) base = candidate;
    } catch {
      // Unparseable — fall through to the configured value.
    }
  }

  if (!base) base = allowed[0] ?? '';

  if (!base) {
    // VERCEL rather than NODE_ENV: Next bakes NODE_ENV=production into every
    // build, so it cannot distinguish a deployment from a local production
    // build (see the note in /api/local-seed).
    if (process.env.VERCEL) {
      throw new Error(
        'passwordLink: NEXT_PUBLIC_APP_URL (or APP_ORIGINS) is not configured. ' +
          'Refusing to send a password link rather than send an unusable or ' +
          'attacker-chosen one.',
      );
    }
    console.error(
      'passwordLink: no configured origin — falling back to localhost for development.',
    );
    base = 'http://localhost:3000';
  }

  return `${base}${path}?token=${encodeURIComponent(token)}`;
}
