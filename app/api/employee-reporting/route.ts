// Who an employee reports to, for the employee record's Reporting hierarchy
// panel. The structure comes from `hod_assignments` (the department lead a
// staff member is assigned to), which is set from the HOD assignment flow —
// this endpoint reads it, it does not change it.
//
// POST { id } → { reports_to: { id, name, role, dept } | null }

import { NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    anyOf: ['can_access_employee_data', 'can_access_reporting_hierarchy', 'can_manage_user_roles'],
  });
  if (!auth.ok) return auth.response;

  const org = auth.user.org;
  if (!org) return NextResponse.json({ error: 'Missing organization on your account.' }, { status: 400 });

  const { id } = await req.json().catch(() => ({ id: null }));
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'A staff id is required.' }, { status: 400 });
  }

  try {
    const staff = await prisma.pesuser.findFirst({
      where: { id: numericId, org },
      select: { id: true, dept: true },
    });
    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found in your organization.' }, { status: 404 });
    }

    const assignment = await prisma.hod_assignments.findFirst({
      where: { user_id: staff.id },
      orderBy: { id: 'desc' },
    });
    if (!assignment) return NextResponse.json({ reports_to: null, dept: staff.dept ?? null });

    // The lead must still belong to the caller's org for us to name them.
    const lead = await prisma.pesuser.findFirst({
      where: { id: assignment.hod_id, org },
      select: { id: true, name: true, role: true, display_role: true, dept: true },
    });

    return NextResponse.json({
      dept: staff.dept ?? null,
      reports_to: lead
        ? {
            id: lead.id,
            name: lead.name,
            role: lead.display_role || lead.role || null,
            dept: lead.dept ?? null,
          }
        : null,
    });
  } catch (err) {
    console.error('employee-reporting error:', err);
    return NextResponse.json({ error: 'Failed to load reporting hierarchy.' }, { status: 500 });
  }
}
