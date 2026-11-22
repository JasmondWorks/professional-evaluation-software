export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../prisma.dev";
import { tokenFromRequest } from "../../../_lib/authGuard";
import { consoleViewer } from "../../../admin/_scope";

// Org admins browse globally-recognized auditors to add to their org for an
// evaluation. Each result carries this org's own org_auditor row (if any) so
// the UI can show a cooldown badge ("paused for this org until <date>")
// without a second request.
export async function GET(req: Request) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;
  if (auth.viewer.isPlatform) {
    return NextResponse.json({ error: "Browse auditors from an organization account" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const auditors = await prisma.pesuser.findMany({
    where: {
      role: "auditor",
      globally_recognized: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, email: true, gsm: true, image: true },
    orderBy: { name: "asc" },
  });

  const pairs = await prisma.org_auditor.findMany({
    where: { org_id: auth.viewer.orgId!, auditor_id: { in: auditors.map((a) => a.id) } },
  });
  const pairByAuditor = new Map(pairs.map((p) => [p.auditor_id, p]));

  return NextResponse.json(
    auditors.map((a) => {
      const pair = pairByAuditor.get(a.id);
      return {
        ...a,
        association: pair
          ? { status: pair.status, consecutive_years: pair.consecutive_years, cooldown_until: pair.cooldown_until }
          : null,
      };
    }),
  );
}
