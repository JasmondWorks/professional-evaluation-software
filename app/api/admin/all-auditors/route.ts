import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer, PUBLIC_USER_COLUMNS } from "../_scope";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

// Auditors: every organization's for the platform operator, the caller's own for
// an org admin. Was unauthenticated and returned full pesuser rows.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const auditors = await prisma.pesuser.findMany({
    where: auth.viewer.isPlatform
      ? { role: "auditor" }
      : { role: "auditor", org: auth.viewer.org },
    select: PUBLIC_USER_COLUMNS,
  });

  return NextResponse.json(auditors);
}
