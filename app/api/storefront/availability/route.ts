/** Is this organization name and administrator email free?
 *
 *  Called from the storefront checkout form, before payment. Both collisions
 *  are refusals after the money has moved otherwise — the worst possible moment
 *  for them, and a refund conversation caused by a missing form validation.
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
import crypto from 'crypto';
import prisma from '@/app/api/prisma.dev';
import { rateLimit } from '@/app/api/_lib/rateLimit';

const MAX_SKEW_SECONDS = 5 * 60;

export async function GET(req: Request) {
  const secret = process.env.PROVISION_HMAC_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'This endpoint is not configured.' }, { status: 503 });
  }

  const url = new URL(req.url);
  const timestamp = req.headers.get('x-timestamp');
  const signature = req.headers.get('x-signature');
  if (!timestamp || !signature) {
    return NextResponse.json(
      { error: 'Missing X-Timestamp or X-Signature.' },
      { status: 401 },
    );
  }

  const sent = Number(timestamp);
  if (!Number.isFinite(sent) || Math.abs(Math.floor(Date.now() / 1000) - sent) > MAX_SKEW_SECONDS) {
    return NextResponse.json({ error: 'X-Timestamp is outside the accepted window.' }, { status: 401 });
  }

  // The query string stands in for the body a GET does not have.
  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(`${timestamp}.${url.search}`).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Signature does not match.' }, { status: 401 });
  }

  // Typed into a form, so called on every keystroke if the storefront debounces
  // badly. Generous but finite.
  const tooMany = rateLimit(req, { key: 'provision-availability', limit: 300, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  const organizationName = url.searchParams.get('organization_name')?.trim();
  const adminEmail = url.searchParams.get('admin_email')?.trim().toLowerCase();

  if (!organizationName && !adminEmail) {
    return NextResponse.json(
      { error: 'Pass organization_name, admin_email, or both.' },
      { status: 400 },
    );
  }

  const [org, user] = await Promise.all([
    organizationName
      ? prisma.org.findUnique({ where: { name: organizationName }, select: { id: true } })
      : Promise.resolve(null),
    adminEmail
      ? prisma.pesuser.findUnique({ where: { email: adminEmail }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({
    ...(organizationName ? { organization_name_available: !org } : {}),
    ...(adminEmail ? { admin_email_available: !user } : {}),
  });
}
