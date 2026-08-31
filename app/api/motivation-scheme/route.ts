// Which motivators this administration has adopted.
//
// The document puts this choice with the head of the establishment (VC/MD), to
// be made once for a tenure and kept on record for it. A change of top
// management does not edit the old selection — it closes it and opens a new
// one, so what a previous administration ran on stays readable.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    const active = await prisma.motivation_scheme.findFirst({
      where: { org, active: true },
      orderBy: { created_at: 'desc' },
    });
    const past = await prisma.motivation_scheme.findMany({
      where: { org, active: false },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return NextResponse.json({ active, past });
  } catch (error) {
    console.error('Error reading the motivation scheme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // The choice belongs to top management, so only an admin may record it.
    const auth = authorize(tokenFromRequest(req), { roles: [] });
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    const role = auth.user?.role ?? '';
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }
    if (!['admin', 'super-admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Only the organization admin may set the motivation scheme.' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const tenure = String(body.tenure ?? '').trim();
    if (!tenure) {
      return NextResponse.json(
        { error: 'Name the administration this selection belongs to.' },
        { status: 400 },
      );
    }

    const selections: string[] = Array.isArray(body.selections)
      ? body.selections.map(String)
      : [];
    const additions: string[] = Array.isArray(body.additions) ? body.additions.map(String) : [];

    // The starred items used to be forced in here. The client asked on 30 Aug
    // for every motivator to be selectable, so the selection is taken as sent.
    const merged = Array.from(new Set(selections));

    const existing = await prisma.motivation_scheme.findFirst({
      where: { org, active: true },
      orderBy: { created_at: 'desc' },
    });

    // Same administration: adjust in place, which the document explicitly
    // allows. A new one: close the old record and open a fresh one.
    if (existing && existing.tenure === tenure) {
      const updated = await prisma.motivation_scheme.update({
        where: { id: existing.id },
        data: { selections: merged, additions },
      });
      return NextResponse.json({ success: true, scheme: updated, replaced: false });
    }

    if (existing) {
      await prisma.motivation_scheme.update({
        where: { id: existing.id },
        data: { active: false, closed_at: new Date() },
      });
    }

    const created = await prisma.motivation_scheme.create({
      data: {
        org,
        tenure,
        selections: merged,
        additions,
        created_by: auth.user?.email ? String(auth.user.email) : null,
      },
    });

    return NextResponse.json({ success: true, scheme: created, replaced: Boolean(existing) });
  } catch (error) {
    console.error('Error saving the motivation scheme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
