// The award record. Page 109: "for each year, every award given and the
// receivers must be recorded".

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

    const periodLabel = new URL(req.url).searchParams.get('period_label');
    const rows = await prisma.motivation_award.findMany({
      where: { org, ...(periodLabel ? { period_label: periodLabel } : {}) },
      orderBy: { awarded_at: 'desc' },
      take: 200,
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error reading the award record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    const role = auth.user?.role ?? '';
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }
    if (!['admin', 'super-admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Only the organization admin may record an award.' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const required = ['staff_name', 'period', 'period_label', 'level', 'motivator'];
    for (const key of required) {
      if (!String(body[key] ?? '').trim()) {
        return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
      }
    }

    const created = await prisma.motivation_award.create({
      data: {
        org,
        user_id: Number.isFinite(Number(body.user_id)) ? Number(body.user_id) : null,
        staff_name: String(body.staff_name),
        dept: body.dept ? String(body.dept) : null,
        period: String(body.period),
        period_label: String(body.period_label),
        level: String(body.level),
        motivator: String(body.motivator),
        detail: body.detail ? String(body.detail) : null,
        cash_amount:
          body.cash_amount == null || body.cash_amount === ''
            ? null
            : Number(body.cash_amount),
        awarded_by: auth.user?.email ? String(auth.user.email) : null,
      },
    });

    return NextResponse.json({ success: true, award: created }, { status: 201 });
  } catch (error) {
    console.error('Error recording an award:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
