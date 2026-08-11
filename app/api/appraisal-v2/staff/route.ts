import { NextResponse } from 'next/server';
import prisma from '@/app/api/prisma.dev';
import { fail, viewerFrom } from '../_auth';

/** The org roster, for choosing who to appraise. Scoped to the caller's org, and
 *  narrowed to a head's own department when they are not an admin. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const isAdmin = ['super-admin', 'admin'].includes(viewer.role);
    const staff = await prisma.pesuser.findMany({
      where: { org: viewer.org, ...(isAdmin ? {} : { dept: viewer.dept ?? undefined }) },
      select: { id: true, name: true, role: true, dept: true, post: true, level: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ staff });
  } catch (err) { return fail(err); }
}
