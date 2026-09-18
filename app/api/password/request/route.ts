/** Ask for a fresh set-password or reset link.
 *
 *  One endpoint for both, because from the person's point of view they are the
 *  same act: "I cannot get in, send me a link". Which wording they receive
 *  depends on whether they have ever set a password.
 *
 *  This is also the recovery path for an expired provisioning link, which is
 *  why it exists at all — without it, an administrator whose welcome email sat
 *  unopened for eight days would need us to intervene.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/app/api/prisma.dev';
import { rateLimit } from '@/app/api/_lib/rateLimit';
import { issuePasswordToken, passwordLink } from '@/app/lib/auth/passwordToken';
import { sendMail } from '@/app/lib/email';
import { escapeHtml } from '@/app/api/_lib/escapeHtml';

export async function POST(req: Request) {
  const tooMany = rateLimit(req, { key: 'password-request', limit: 5, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  // The same answer whether or not the account exists. Anything else turns this
  // into a way to discover who is registered.
  const same = NextResponse.json({
    ok: true,
    message: 'If that email has an account, a link is on its way.',
  });

  if (!email) return same;

  const user = await prisma.pesuser.findUnique({
    where: { email },
    select: { id: true, name: true, first_login_at: true },
  });
  if (!user) return same;

  // Someone who has never signed in is finishing setup, not recovering — and
  // the email should say so, or it reads as though something has gone wrong.
  const purpose = user.first_login_at ? 'reset' : 'setup';
  const { token, expiresAt } = await issuePasswordToken(user.id, purpose);
  const link = passwordLink(token, purpose);

  try {
    await sendMail({
      to: email,
      subject: purpose === 'setup' ? 'Set your PES password' : 'Reset your PES password',
      html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#1b1b28;max-width:520px;margin:0 auto;padding:8px">
  <h1 style="font-size:19px;font-weight:600;margin:0 0 6px">
    ${purpose === 'setup' ? 'Finish setting up your account' : 'Reset your password'}
  </h1>
  <p style="font-size:15px;color:#4b4b5c;margin:0 0 22px">
    Hello${user.name ? ' ' + escapeHtml(user.name) : ''}, use the button below to
    ${purpose === 'setup' ? 'choose your password' : 'choose a new password'}.
  </p>
  <p style="margin:0 0 10px">
    <a href="${link}" style="display:inline-block;background:#322b80;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px">
      ${purpose === 'setup' ? 'Set your password' : 'Reset password'}
    </a>
  </p>
  <p style="font-size:13px;color:#6b6b7b;margin:0">
    This link works once and expires on
    ${expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
  </p>
  <p style="font-size:12px;color:#9a9aad;margin:24px 0 0;border-top:1px solid #e6e6ee;padding-top:14px">
    If you did not ask for this, ignore it — your current password still works
    and nothing has changed.
  </p>
</div>`,
    });
  } catch (err) {
    // Logged, not surfaced: telling the caller the send failed would also tell
    // them the address exists.
    console.error('password request: email failed', err);
  }

  return same;
}
