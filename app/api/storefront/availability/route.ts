/** Is this administrator email free?
 *
 *  Called from the storefront checkout form, before payment. An email
 *  collision is a refusal after the money has moved otherwise — the worst
 *  possible moment for it, and a refund conversation caused by a missing
 *  form validation.
 *
 *  Organization name is NOT checked for uniqueness: two organizations may
 *  legitimately share a name (unrelated companies/schools around the world
 *  coincidentally named the same), and each org is identified by its own
 *  `org.id`, not its name. Only the administrator's email — which really is
 *  meant to be globally unique, since it's their sign-in credential —
 *  blocks provisioning.
 *
 *  organization_name is still a required parameter here (the caller sends
 *  the full pair it's about to submit to /provision), it is just never
 *  looked up or refused on.
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

  const user = await prisma.pesuser.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });

  return NextResponse.json({
    admin_email_available: !user,
  });
}
