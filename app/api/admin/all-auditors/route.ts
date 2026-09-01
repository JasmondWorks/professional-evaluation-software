import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

// Auditors across every organization — platform console only.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const auditors = await prisma.pesuser.findMany({
    where: { role: "auditor" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      org: true,
      dept: true,
      gsm: true,
      address: true,
      image: true,
      audit_count: true,
    },
  });

  return NextResponse.json(auditors);
}
