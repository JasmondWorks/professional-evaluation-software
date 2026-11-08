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

/** The link that goes in the email.
 *
 *  `origin` is the host the request arrived on, and is preferred when given.
 *  NEXT_PUBLIC_APP_URL is routinely empty — it is empty in .env.local and the
 *  invite route already carries a comment about it being empty in production —
 *  and this function used to fall through to `''`, producing the bare relative
 *  path `/set-password?token=…`. That is not a link: mail clients autolink it
 *  into something like `http://set-password/?token=…`, with the path as the
 *  hostname, so every set-password and reset-password mail sent while the
 *  variable was unset was undeliverable in practice.
 *
 *  Falls back to localhost so a developer still gets a working link, and logs
 *  loudly, because a silent wrong link is only discovered by the person who
 *  cannot use it. */
export function passwordLink(
  token: string,
  purpose: TokenPurpose,
  origin?: string | null,
): string {
  const path = purpose === 'setup' ? '/set-password' : '/reset-password';

  // Validated rather than trusted: this value ends up in an href in an email.
  let base = '';
  if (origin) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        base = parsed.origin;
      }
    } catch {
      // Fall through to the configured value.
    }
  }

  if (!base) base = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');

  if (!base) {
    console.error(
      'passwordLink: no request origin and NEXT_PUBLIC_APP_URL is unset — ' +
        'falling back to localhost. Emails sent from a deployment will carry ' +
        'an unusable link until NEXT_PUBLIC_APP_URL is configured.',
    );
    base = 'http://localhost:3000';
  }

  return `${base}${path}?token=${token}`;
}
