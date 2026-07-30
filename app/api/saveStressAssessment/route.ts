import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { effectivePhase } from "../_lib/stressCycle";
import { notifyDeptHod } from "../_lib/notify";

// Saves a staff member's Form 6/7 (theme & feeling) submission. One submission
// per staff per cycle, only while the feeling phase is open.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ["super-admin", "admin", "lecturer", "industrial-engineer", "hod", "employee-w", "auditor"],
  });
  if (!auth.ok) return auth.response;

  const org = auth.user.org;
  const pesuser_name = auth.user.name || "Anonymous";
  const dept = auth.user.dept || "General";

  try {
    const { form6, form7 } = await req.json();

    // The feeling phase must be open.
    const cycle = await prisma.stressCycle.findFirst({
      where: { org: org ?? undefined },
      orderBy: { created_at: "desc" },
    });
    if (!cycle || effectivePhase(cycle) !== "feeling_open") {
      return NextResponse.json(
        { success: false, message: "The theme & feeling form is not currently open for submissions." },
        { status: 409 },
      );
    }

    const assessment_data = {
      stressThemes: form6 ?? null,
      stressFeelings: form7 ?? null,
      frequency: form6?.frequency ?? form7?.frequency ?? null,
    };

    // If a previous submission was REJECTED (sent back), let the staff member
    // re-submit by overwriting that same row (clearing the rejection). Only an
    // active (non-rejected) submission blocks re-submission.
    const rejectedRow = await prisma.stress.findFirst({
      where: { pesuser_name, org: org ?? undefined, cycle_id: cycle.id, rejected: true },
      select: { id: true },
    });
    const activeCount = await prisma.stress.count({
      where: { pesuser_name, org: org ?? undefined, cycle_id: cycle.id, rejected: false },
    });
    if (activeCount > 0) {
      return NextResponse.json(
        { success: false, message: "You have already submitted this form for the current cycle." },
        { status: 409 },
      );
    }

    if (rejectedRow) {
      await prisma.stress.update({
        where: { id: rejectedRow.id },
        data: {
          dept,
          assessment_data,
          rejected: false,
          rejection_reason: null,
          rejected_by: null,
          rejected_at: null,
        },
      });
    } else {
      await prisma.stress.create({
        data: { pesuser_name, org: org ?? undefined, dept, cycle_id: cycle.id, assessment_data },
      });
    }

    // Nudge the department's HOD that a submission awaits approval.
    if (org && dept) {
      await notifyDeptHod(
        prisma,
        org,
        dept,
        "Stress submission to approve",
        `${pesuser_name} submitted their theme & feeling form. It's awaiting your approval.`,
      );
    }

    return NextResponse.json({ success: true, message: "Stress data saved." });
  } catch (err: any) {
    console.error("Error saving stress data:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
