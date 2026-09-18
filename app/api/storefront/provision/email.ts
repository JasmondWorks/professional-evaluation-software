/** The welcome email. SERVER ONLY.
 *
 *  No password in here, deliberately. The administrator never had one: the link
 *  is how they choose their first, which means nothing sensitive sits in an
 *  inbox or in a forwarded thread, and the link stops working once used.
 */

import { sendMail } from '@/app/lib/email';
import { escapeHtml } from '@/app/api/_lib/escapeHtml';
import type { InstitutionType, PlanType } from '@/app/lib/billing/catalog';

const CATEGORY_LABEL: Record<InstitutionType, string> = {
  ACADEMIC: 'Academic',
  COMPANY: 'Company',
  PUBLIC: 'Public sector',
};

const TIER_LABEL: Record<PlanType, string> = {
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
};

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function sendWelcomeEmail(input: {
  to: string;
  adminName: string;
  organization: string;
  institutionType: InstitutionType;
  plan: PlanType;
  link: string;
  linkExpiresAt: Date;
  accessExpiresAt: Date;
}) {
  const {
    to, adminName, organization, institutionType, plan, link, linkExpiresAt, accessExpiresAt,
  } = input;

  const product = `${CATEGORY_LABEL[institutionType]} — ${TIER_LABEL[plan]}`;

  return sendMail({
    to,
    subject: `${organization} is set up on PES`,
    html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#1b1b28;max-width:560px;margin:0 auto;padding:8px">
  <h1 style="font-size:20px;font-weight:600;margin:0 0 4px">Welcome to PES, ${escapeHtml(adminName)}</h1>
  <p style="font-size:15px;color:#4b4b5c;margin:0 0 24px">
    Your payment is confirmed and <strong>${escapeHtml(organization)}</strong> has been created.
    You are its administrator.
  </p>

  <table style="width:100%;border-collapse:collapse;background:#f7f7fa;border-radius:10px;margin:0 0 24px">
    <tr>
      <td style="padding:12px 14px;font-size:13px;color:#6b6b7b">Organization</td>
      <td style="padding:12px 14px;font-size:14px;font-weight:600;text-align:right">${escapeHtml(organization)}</td>
    </tr>
    <tr>
      <td style="padding:12px 14px;font-size:13px;color:#6b6b7b;border-top:1px solid #e6e6ee">Your sign-in email</td>
      <td style="padding:12px 14px;font-size:14px;font-weight:600;text-align:right;border-top:1px solid #e6e6ee">${escapeHtml(to)}</td>
    </tr>
    <tr>
      <td style="padding:12px 14px;font-size:13px;color:#6b6b7b;border-top:1px solid #e6e6ee">Plan</td>
      <td style="padding:12px 14px;font-size:14px;font-weight:600;text-align:right;border-top:1px solid #e6e6ee">${product}</td>
    </tr>
    <tr>
      <td style="padding:12px 14px;font-size:13px;color:#6b6b7b;border-top:1px solid #e6e6ee">Renews</td>
      <td style="padding:12px 14px;font-size:14px;font-weight:600;text-align:right;border-top:1px solid #e6e6ee">${formatDate(accessExpiresAt)}</td>
    </tr>
  </table>

  <p style="font-size:15px;margin:0 0 16px">
    Choose your password to finish setting up your account:
  </p>
  <p style="margin:0 0 8px">
    <a href="${link}" style="display:inline-block;background:#322b80;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px">
      Set your password
    </a>
  </p>
  <p style="font-size:13px;color:#6b6b7b;margin:0 0 28px">
    This link works once and expires on ${formatDate(linkExpiresAt)}.
    If it has expired, you can request a new one from the sign-in page.
  </p>

  <p style="font-size:14px;color:#4b4b5c;margin:0 0 8px"><strong>What to do first</strong></p>
  <p style="font-size:14px;color:#4b4b5c;margin:0 0 24px">
    Add your staff to the Employee Database, assign their roles, then open the
    models. The user guide walks through it in order.
  </p>

  <p style="font-size:12px;color:#9a9aad;margin:24px 0 0;border-top:1px solid #e6e6ee;padding-top:16px">
    You are receiving this because a PES plan was purchased for ${escapeHtml(organization)}.
    Nobody can sign in to this account until you set a password.
  </p>
</div>`,
  });
}
