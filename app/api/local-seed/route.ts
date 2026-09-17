// Local-dev-only: seeds one organization/admin/employee set through a public
// UI form instead of a hand-edited JSON file. Deliberately unauthenticated —
// it exists to run before any account exists — so it must refuse to do
// anything unless it can prove it's talking to a local database:
//
//   1. NODE_ENV !== 'production' — blocks it in every deployed build, since
//      Vercel always builds and runs with NODE_ENV=production.
//   2. DATABASE_URL points at localhost/127.0.0.1 — blocks it even from a
//      local `next start` accidentally pointed at Neon.
//   3. isLocalSeeded() — blocks it once an org exists, seeded or real.
//
// Any one of these failing is enough to refuse; all three must hold to seed.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { isLocalSeeded, seedLocalOrg, type LocalSeedInput } from '../_lib/localSeed';

function isLocalDatabase(): boolean {
  const url = process.env.DATABASE_URL || '';
  return /(localhost|127\.0\.0\.1)/.test(url);
}

function guardOrResponse(): NextResponse | null {
  if (process.env.NODE_ENV === 'production' || !isLocalDatabase()) {
    return NextResponse.json(
      { message: 'Local seeding is disabled outside local development.' },
      { status: 403 },
    );
  }
  return null;
}

export async function GET() {
  const blocked = guardOrResponse();
  if (blocked) return blocked;

  const seeded = await isLocalSeeded();
  return NextResponse.json({ seeded });
}

export async function POST(req: Request) {
  const blocked = guardOrResponse();
  if (blocked) return blocked;

  const body = (await req.json()) as LocalSeedInput;

  if (!body?.org?.name || !body?.admin?.email || !body?.admin?.password) {
    return NextResponse.json({ message: 'Organization name and admin email/password are required.' }, { status: 400 });
  }

  const result = await seedLocalOrg({
    org: body.org,
    admin: body.admin,
    employees: Array.isArray(body.employees) ? body.employees : [],
  });

  if (!result.ok) {
    const status = result.reason === 'already_seeded' ? 409 : 400;
    return NextResponse.json({ message: result.message }, { status });
  }

  return NextResponse.json(result);
}
