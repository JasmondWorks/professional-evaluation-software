export const dynamic = "force-dynamic";
import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { authorize, tokenFromRequest } from "../../../../_lib/authGuard";

// Org named in the URL — platform console only, same reasoning as ./users.
export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const auditors = await prisma.pesuser.findMany({
    where: { org: params.org, role: "auditor" },
    select: { id: true, name: true, email: true, role: true, org: true },
  });

  return NextResponse.json(auditors);
}
