import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.dev';

/** Who the signed-in user reports to.
 *
 *  The profile page previously showed an empty, disabled text box here with a
 *  placeholder borrowed from a different form, which read as "no manager" when
 *  in fact nothing had ever been looked up. This answers the question honestly:
 *  a name when there is one, and null when the reporting line has not been set.
 */
export async function GET(req: Request) {
  try {
    const header = req.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.json({ error: 'Server auth is not configured.' }, { status: 500 });

    let claims: any;
    try {
      claims = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 });
    }

    const me = await prisma.pesuser.findFirst({
      where: { name: claims.name, org: claims.org },
      select: { id: true, dept: true },
    });
    if (!me) return NextResponse.json({ reportsTo: null, dept: null });

    const assignment = await prisma.hod_assignments.findFirst({
      where: { user_id: me.id },
      select: { hod_id: true },
    });
    if (!assignment) return NextResponse.json({ reportsTo: null, dept: me.dept });

    const head = await prisma.pesuser.findFirst({
      where: { id: assignment.hod_id, org: claims.org },
      select: { name: true, role: true, display_role: true, dept: true },
    });

    return NextResponse.json({
      reportsTo: head
        ? { name: head.name, role: head.display_role || head.role, dept: head.dept }
        : null,
      dept: me.dept,
    });
  } catch (err) {
    console.error('my-reporting-line error:', err);
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
