export const dynamic = "force-dynamic";
import prisma from "../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../../_lib/authGuard";
import { consoleViewer, canReachOrg, PUBLIC_USER_COLUMNS } from "../../_scope";

// A user id says nothing about which organization it belongs to, so both
// handlers read the target's org before deciding — an org admin may only touch
// their own people. DELETE previously ran deleteMany off the URL with no auth at
// all: anyone who could reach the deployment could walk the ids and empty the
// table.
async function resolve(req: NextRequest, rawId: string) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return { ok: false as const, response: auth.response };

  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid user id" }, { status: 400 }),
    };
  }

  const target = await prisma.pesuser.findUnique({
    where: { id },
    select: PUBLIC_USER_COLUMNS,
  });
  if (!target) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  if (!canReachOrg(auth.viewer, target.org ?? "")) {
    // Same body as "not found": which ids exist in another org is not something
    // this caller should be able to learn either.
    return {
      ok: false as const,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return { ok: true as const, id, target };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await resolve(req, params.id);
  if (!r.ok) return r.response;

  return NextResponse.json(r.target);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const r = await resolve(req, params.id);
  if (!r.ok) return r.response;

  await prisma.pesuser.delete({ where: { id: r.id } });

  return NextResponse.json({ success: true });
}
