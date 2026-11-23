export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

// An auditor whose global recognition was rejected or revoked may request
// again at any time — no cooldown, no request limit, admin discretion each
// time per the client. No new questionnaire submission is required.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ["auditor"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const userId = auth.user.userID;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auditor = await prisma.pesuser.findUnique({ where: { id: userId } });
  if (!auditor || auditor.role !== "auditor") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (auditor.globally_recognized || auditor.global_recognition_status === "pending") {
    return NextResponse.json(
      { error: "You already hold or have a pending global recognition request" },
      { status: 409 },
    );
  }

  await prisma.pesuser.update({
    where: { id: userId },
    data: { global_recognition_status: "pending", global_recognition_requested_at: new Date() },
  });

  return NextResponse.json({ success: true, message: "Global recognition requested" });
}
