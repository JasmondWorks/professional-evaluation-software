export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../prisma.dev";
import { tokenFromRequest } from "../../../_lib/authGuard";
import { consoleViewer } from "../../../admin/_scope";

// Org admin adds a globally-recognized auditor to their org. Enforces the
// 3-consecutive-year cap: after a globally-recognized auditor has served
// THIS org for 3 consecutive years, they're blocked from reassignment to
// THIS org for a 2-year cooldown — other orgs are unaffected, since the
// tracking is per (org, auditor) pair.
export async function POST(req: Request) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;
  if (auth.viewer.isPlatform) {
    return NextResponse.json({ error: "Assign auditors from an organization account" }, { status: 403 });
  }

  const { auditorId } = await req.json();
  if (!auditorId) {
    return NextResponse.json({ error: "auditorId is required" }, { status: 400 });
  }

  const auditor = await prisma.pesuser.findUnique({ where: { id: auditorId } });
  if (!auditor || auditor.role !== "auditor") {
    return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
  }
  if (!auditor.globally_recognized) {
    return NextResponse.json(
      { error: "Only globally recognized auditors can be added this way" },
      { status: 403 },
    );
  }

  const orgId = auth.viewer.orgId!;
  const existingPair = await prisma.org_auditor.findFirst({ where: { org_id: orgId, auditor_id: auditorId } });

  if (existingPair?.status === "active") {
    return NextResponse.json({ success: true, message: "Already associated with this organization" });
  }

  const currentYear = new Date().getFullYear();

  if (existingPair?.cooldown_until && existingPair.cooldown_until > new Date()) {
    return NextResponse.json(
      {
        error: `This auditor is paused for your organization until ${existingPair.cooldown_until.toISOString().slice(0, 10)} after 3 consecutive years of service here. They remain available to other organizations.`,
        cooldown_until: existingPair.cooldown_until,
      },
      { status: 409 },
    );
  }

  const isConsecutive = existingPair?.last_served_year === currentYear - 1;
  const consecutiveYears = isConsecutive ? (existingPair?.consecutive_years ?? 0) + 1 : 1;
  const cooldownUntil = consecutiveYears >= 3 ? new Date(currentYear + 3, 0, 1) : null;

  if (existingPair) {
    await prisma.org_auditor.update({
      where: { id: existingPair.id },
      data: {
        status: "active",
        ended_at: null,
        consecutive_years: consecutiveYears,
        last_served_year: currentYear,
        cooldown_until: cooldownUntil,
      },
    });
  } else {
    await prisma.org_auditor.create({
      data: {
        org_id: orgId,
        auditor_id: auditorId,
        status: "active",
        consecutive_years: consecutiveYears,
        last_served_year: currentYear,
        cooldown_until: cooldownUntil,
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: "Auditor added to your organization",
    consecutive_years: consecutiveYears,
    cooldown_until: cooldownUntil,
  });
}
