// Local-dev-only: seeds an organization/admin/employee set through a public UI
// form instead of a hand-edited JSON file — repeatable, so several orgs can be
// built up one after another in the same database. Deliberately
// unauthenticated — it exists to run before any account exists — so it must
// refuse to do anything unless it can prove it's not talking to a real
// deployment:
//
//   1. LOCAL_SEED_ENABLED === 'true' — blocks it everywhere by default; opt in
//      per-environment via the Vercel dashboard or .env.local. NODE_ENV can't
//      be used for this: Next.js bakes NODE_ENV=production into every `next
//      build` output regardless of what's set in the deployment's env vars,
//      so a dashboard override is silently ignored.
//   2. isOrgSeeded(name) — blocks re-seeding an org with the same name, but
//      lets other org names through (see app/api/_lib/localSeed.ts).
//
// Any one of these failing is enough to refuse; both must hold to seed.
// (Previously also required DATABASE_URL to contain localhost/127.0.0.1 —
// dropped because plenty of local dev setups point at a remote dev database,
// e.g. a separate Neon branch.)
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { listSeededOrgs, readCredentialsFile, seedLocalOrg, type LocalSeedInput } from '../_lib/localSeed';

function guardOrResponse(): NextResponse | null {
  if (process.env.LOCAL_SEED_ENABLED !== 'true') {
    return NextResponse.json(
      { message: 'Local seeding is disabled. Set LOCAL_SEED_ENABLED=true to enable it in this environment.' },
      { status: 403 },
    );
  }
  return null;
}

export async function GET() {
  const blocked = guardOrResponse();
  if (blocked) return blocked;

  const orgs = listSeededOrgs();
  return NextResponse.json({
    orgs,
    credentialsText: orgs.length > 0 ? readCredentialsFile() : null,
  });
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
