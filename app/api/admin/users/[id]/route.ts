export const dynamic = "force-dynamic";
import prisma from "../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { authorize, tokenFromRequest } from "../../../_lib/authGuard";

// DELETE here took a user id off the URL and ran deleteMany with no auth at all:
// anyone who could reach the deployment could enumerate ids and empty pesuser.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  await prisma.pesuser.deleteMany({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const user = await prisma.pesuser.findUnique({
    where: { id },
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

  return NextResponse.json(user);
}
