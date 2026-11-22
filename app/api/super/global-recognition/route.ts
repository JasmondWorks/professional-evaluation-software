export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

// Platform admin's queue: auditors who answered "Yes" to the questionnaire's
// global-recognition question (seeded by /api/admin/auditors on approval, no
// separate invite). Distinct from the org-scoped onboarding queue.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const pending = await prisma.pesuser.findMany({
    where: { role: "auditor", global_recognition_status: "pending" },
    select: {
      id: true,
      name: true,
      email: true,
      gsm: true,
      address: true,
      image: true,
      org_id: true,
      global_recognition_requested_at: true,
    },
    orderBy: { global_recognition_requested_at: "asc" },
  });

  // Pull each one's questionnaire answers + uploaded documents for the
  // approve/reject decision — per the client, this can be an instant call
  // based on what's uploaded.
  const emails = pending.map((p) => p.email);
  const responses = await prisma.auditor_responses.findMany({
    where: { email: { in: emails } },
    select: { email: true, responses: true, credential_data: true },
  });
  const byEmail = new Map(responses.map((r) => [r.email, r]));

  return NextResponse.json(
    pending.map((p) => ({
      ...p,
      responses: byEmail.get(p.email)?.responses ?? null,
      credential_data: byEmail.get(p.email)?.credential_data ?? null,
    })),
  );
}

// Approve or reject a pending global recognition request. No second invite is
// sent either way — the auditor already has an account via the org admin's
// original invite.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const { auditorId, action } = await req.json();
  if (!auditorId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const auditor = await prisma.pesuser.findUnique({ where: { id: auditorId } });
  if (!auditor || auditor.role !== "auditor") {
    return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
  }

  const updated = await prisma.pesuser.update({
    where: { id: auditorId },
    data:
      action === "approve"
        ? { globally_recognized: true, global_recognition_status: "approved", global_recognition_decided_at: new Date() }
        : { globally_recognized: false, global_recognition_status: "rejected", global_recognition_decided_at: new Date() },
  });

  return NextResponse.json({
    success: true,
    message: action === "approve" ? "Auditor granted global recognition" : "Global recognition request rejected",
    globally_recognized: updated.globally_recognized,
  });
}
