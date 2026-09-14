/** Is this organization name and administrator email free?
 *
 *  Called from the storefront checkout form, before payment. Both collisions
 *  are refusals after the money has moved otherwise — the worst possible moment
 *  for them, and a refund conversation caused by a missing form validation.
 *
 *  Both fields are required: /provision needs both to succeed, so a check
 *  that only covers one would let the form move on to payment with the
 *  other collision still undiscovered.
 *
 *  Not a webhook, despite sitting beside one: a person is typing into a form
 *  and waiting for the answer. It is here because it shares the provisioning
 *  call's caller and secret, which is what /api/storefront names.
 *
 *  Signed the same way. A GET has no body, so the signature is over the query
 *  string, which is what identifies the request.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/app/api/prisma.dev';
import { rateLimit } from '@/app/api/_lib/rateLimit';
import { verifySignedQuery } from '@/app/api/_lib/hmacGuard';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const signed = verifySignedQuery(req, url);
  if (!signed.ok) return signed.response;

  // Typed into a form, so called on every keystroke if the storefront debounces
  // badly. Generous but finite.
  const tooMany = rateLimit(req, { key: 'provision-availability', limit: 300, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  const organizationName = url.searchParams.get('organization_name')?.trim();
  const adminEmail = url.searchParams.get('admin_email')?.trim().toLowerCase();

  if (!organizationName || !adminEmail) {
    return NextResponse.json(
      { error: 'Pass both organization_name and admin_email.' },
      { status: 400 },
    );
  }

  const [org, user] = await Promise.all([
    prisma.org.findUnique({ where: { name: organizationName }, select: { id: true } }),
    prisma.pesuser.findUnique({ where: { email: adminEmail }, select: { id: true } }),
  ]);

  return NextResponse.json({
    organization_name_available: !org,
    admin_email_available: !user,
  });
}
