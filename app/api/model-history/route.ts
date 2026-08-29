// Removing a single stored run from a model's history.
//
// The histories are not just a log: the future-requirement prediction fits a
// line through them, so one mistyped run drags every extrapolation drawn
// afterwards. The client asked to be able to take individual rows out, which is
// what this does — one row, by id, and only ever from the caller's own
// organization.

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.dev';

/** The tables a history row may be deleted from, and the delegate for each.
 *  An allow-list rather than a table name taken off the request: the name
 *  arrives from the browser, and nothing from the browser should get to choose
 *  what gets deleted. */
const DELETABLE = {
  'personnel-utilization': () => prisma.personnel_utilization,
  'supervision-cost': () => prisma.supervision_cost,
  index: () => prisma.index,
} as const;

type HistoryKey = keyof typeof DELETABLE;

function orgFrom(req: Request): string {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw Object.assign(new Error('Sign in to continue.'), { status: 401 });

  const secret = process.env.JWT_SECRET;
  if (!secret) throw Object.assign(new Error('Server auth is not configured.'), { status: 500 });

  let claims: any;
  try {
    claims = jwt.verify(token, secret);
  } catch {
    throw Object.assign(new Error('Your session has expired. Sign in again.'), { status: 401 });
  }
  if (!claims?.org) {
    throw Object.assign(new Error('This account is not attached to an organization.'), {
      status: 403,
    });
  }
  return claims.org as string;
}

export async function DELETE(req: Request) {
  try {
    const org = orgFrom(req);
    const url = new URL(req.url);
    const source = url.searchParams.get('source') as HistoryKey | null;
    const id = Number(url.searchParams.get('id'));

    if (!source || !(source in DELETABLE)) {
      return NextResponse.json({ error: 'Unknown history source.' }, { status: 400 });
    }
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'A record id is required.' }, { status: 400 });
    }

    // deleteMany, not delete, so the org is part of the match rather than a
    // check made after the fact — a row belonging to another organization
    // matches nothing instead of being read and then refused.
    const { count } = await (DELETABLE[source]() as any).deleteMany({ where: { id, org } });

    if (count === 0) {
      return NextResponse.json({ error: 'That record no longer exists.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    if (err?.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('model-history delete error:', err);
    return NextResponse.json({ error: 'Could not remove that record.' }, { status: 500 });
  }
}
