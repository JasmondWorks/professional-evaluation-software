import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard"; // adjust path as needed

// A personnel-redundancy run. The org it was filed under came from the body, so anyone
// could write a run into anyone's history — and the history is not just a log:
// the future-requirement prediction fits a line through it.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

  try {
    const body = await req.json();
    const {
      actual_staff,
      optimal_staff,
      low_threshold,
      moderate_threshold,
      pr_value,
      rating,
    } = body;

    // Basic validation
    if (
      !org ||
      !actual_staff ||
      !optimal_staff ||
      pr_value === undefined ||
      !rating
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await prisma.personnel_redundancy.create({
      data: {
        org,
        actual_staff: Number(actual_staff),
        optimal_staff: Number(optimal_staff),
        low_threshold: Number(low_threshold),
        moderate_threshold: Number(moderate_threshold),
        pr_value,
        rating,
      },
    });

    return NextResponse.json({ success: true, message: "Record saved successfully" });
  } catch (err: any) {
    console.error("Error saving redundancy:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
