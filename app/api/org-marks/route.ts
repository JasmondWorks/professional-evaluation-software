// Reads the caller's token, so this can never be a static route.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

// The signed-in user's organization name and its two marks.
//
// This exists so the award artwork never has to read the access token itself.
// The token lives in memory, not localStorage, so on a hard load of
// /reward/certificates/... it is empty until a refresh completes — and the
// first version of useOrgMarks read it once on mount, found nothing, and gave
// up. Certificates rendered with no institution logo and no coat of arms,
// which is precisely what the client asked to see on them.
//
// apiFetch performs that refresh, so going through an endpoint rather than
// decoding a token on the client means the marks arrive whenever the session
// does. The organization is resolved from the verified token server-side, so
// there is no id for a caller to tamper with either.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const orgId = (auth.user as any)?.orgId;
  if (!orgId) {
    // A platform operator belongs to no organization, so an award has no
    // issuer to name. Not an error — the artwork renders without marks.
    return NextResponse.json({ org: '', logoUrl: null, coatOfArmsUrl: null });
  }

  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { name: true, logo_url: true, coat_of_arms_url: true },
    });

    return NextResponse.json({
      org: org?.name ?? '',
      logoUrl: org?.logo_url ?? null,
      coatOfArmsUrl: org?.coat_of_arms_url ?? null,
    });
  } catch (err) {
    console.error('org-marks failed:', err);
    return NextResponse.json({ error: 'Could not load the organization.' }, { status: 500 });
  }
}
