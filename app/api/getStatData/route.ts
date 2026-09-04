// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { rosterWhere } from "../_lib/roster";

/** Dashboard headline counts.
 *
 *  "employees" is everyone on the roster, administrators included, and is the
 *  same basis as the employee database page. "assessable" is the subset that
 *  can actually be assessed, which is the basis the assessment page uses.
 *  Returning both from one query is what stops the two pages contradicting
 *  each other: they are different measures of one roster, not two roster
 *  counts that happen to disagree. */
async function getStats(org: string) {
  const [employees, assessable, completedAppraisals, pendingAppraisals] =
    await Promise.all([
      prisma.pesuser.count({ where: { org } }),
      prisma.pesuser.count({ where: rosterWhere(org) }),
      prisma.appraisal.count({ where: { org, pending: false } }),
      prisma.appraisal.count({ where: { org, pending: true } }),
    ]);

  return { employees, assessable, completedAppraisals, pendingAppraisals };
}

export async function POST(request: NextRequest) {
  // This route used to call jwtDecode() straight on the bearer token, which
  // reads the payload without checking the signature. Anyone could mint a token
  // naming any org and read that org's counts. authorize() verifies it.
  const auth = authorize(tokenFromRequest(request), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;
  if (!org) {
    return NextResponse.json({
      employees: 0, assessable: 0, completedAppraisals: 0, pendingAppraisals: 0,
    });
  }

  try {
    return NextResponse.json(await getStats(org));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
