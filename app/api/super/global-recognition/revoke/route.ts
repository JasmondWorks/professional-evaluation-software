export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../prisma.dev";
import { authorize, tokenFromRequest } from "../../../_lib/authGuard";

// Revoking is distinct from rejecting: it ends a recognition that was
// previously APPROVED (e.g. following negative reports), can happen at any
// time, and leaves global_recognition_status as "approved" so the history
// reads as "approved, then revoked" rather than looking like a fresh denial.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const { auditorId } = await req.json();
  if (!auditorId) {
    return NextResponse.json({ error: "auditorId is required" }, { status: 400 });
  }

  const auditor = await prisma.pesuser.findUnique({ where: { id: auditorId } });
  if (!auditor || auditor.role !== "auditor" || !auditor.globally_recognized) {
    return NextResponse.json({ error: "Auditor is not currently globally recognized" }, { status: 404 });
  }

  await prisma.pesuser.update({
    where: { id: auditorId },
    data: { globally_recognized: false, global_recognition_revoked_at: new Date() },
  });

  return NextResponse.json({ success: true, message: "Global recognition revoked" });
}
