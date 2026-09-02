import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

// Writes an appraisal. The org was decoded, not verified, so the row could be
// written into any organization's appraisal table.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

  try {

    // ✅ Clone request to avoid body lock
    const clonedReq = req.clone();
    const body = await clonedReq.json();

    const { pesuser_name, isCounter = false, isAuditor = false, ...payload } = body;

    if (!pesuser_name || !org || Object.keys(payload).length === 0) {
      return NextResponse.json(
        { message: "Missing required fields or empty payload" },
        { status: 400 }
      );
    }

    // Fetch dept from pesuser
    const user = await prisma.pesuser.findFirst({
      where: { name: pesuser_name, org },
      select: { dept: true },
    });

    if (!user?.dept) {
      return NextResponse.json(
        { message: "User not found or department missing" },
        { status: 404 }
      );
    }

    const dept = user.dept;
    const targetDelegate: any =
      isCounter || !isAuditor ? prisma.counter_appraisal : prisma.appraisal;

    // payload keys are appraisal score columns; spread them into the row.
    // counter_appraisal has no unique on (pesuser_name, org, dept), so we can't
    // rely on upsert — do a constraint-independent find-then-write.
    const existing = await targetDelegate.findFirst({
      where: { pesuser_name, org, dept },
      select: { id: true },
    });

    if (existing) {
      await targetDelegate.updateMany({
        where: { pesuser_name, org, dept },
        data: { ...payload },
      });
    } else {
      await targetDelegate.create({
        data: { pesuser_name, org, dept, ...payload },
      });
    }

    // ✅ If this is a main appraisal, delete matching counter_appraisal scores
    if (!isCounter && isAuditor) {
      await prisma.counter_appraisal.deleteMany({
        where: { pesuser_name, org, dept },
      });
      console.log(`Deleted counter_appraisal scores for ${pesuser_name} (${org} / ${dept})`);
    }

    return NextResponse.json(
      { message: `${isCounter ? "Counter" : "Main"} appraisal saved (replaced if existed)` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Prisma query error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
