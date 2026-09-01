// Saved maintenance computations and their preventive schedules.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

// Saving a maintenance run is open to anyone signed in to the organization, and
// deliberately so. The client's instruction of 1 September is that the unit
// group head runs this model and must not wait on the organization admin. The
// organization's own accounts do not all hold preset roles — most of them carry
// a custom role that falls back to the baseline employee surface — so naming
// roles here would lock out the very people meant to use it.

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    const facility = new URL(req.url).searchParams.get('facility');
    const runs = await prisma.maintenance_run.findMany({
      where: { org, ...(facility ? { facility } : {}) },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error('Error reading maintenance runs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    const body = await req.json();
    const facility = String(body.facility ?? '').trim();
    if (!facility) {
      return NextResponse.json({ error: 'Which facility is this for?' }, { status: 400 });
    }

    const num = (v: any) =>
      v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v);

    const saved = await prisma.maintenance_run.create({
      data: {
        org,
        facility,
        inputs: body.inputs ?? {},
        results: body.results ?? {},
        optimal_interval: num(body.optimal_interval),
        planned_hours: num(body.planned_hours),
        cycles: num(body.cycles) == null ? null : Math.trunc(Number(body.cycles)),
        days_between: num(body.days_between) == null ? null : Math.trunc(Number(body.days_between)),
        starts_on: body.starts_on ? new Date(body.starts_on) : null,
        schedule: Array.isArray(body.schedule) ? body.schedule : [],
        run_by: auth.user?.email ? String(auth.user.email) : null,
      },
    });

    return NextResponse.json({ success: true, run: saved }, { status: 201 });
  } catch (error) {
    console.error('Error saving a maintenance run:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
