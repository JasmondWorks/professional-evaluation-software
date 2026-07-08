import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { form6, form7 } = body;

    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded: any = token ? jwtDecode(token) : {};
    const pesuser_name = decoded?.name || "Anonymous";
    const org = decoded?.org || "Unknown Org";
    const dept = decoded?.dept || "General";

    // Store both forms as structured JSON in the dedicated assessment_data column
    // (the stress_theme/stress_feeling_frequency columns are numeric survey scores).
    await prisma.stress.create({
      data: {
        pesuser_name,
        org,
        dept,
        assessment_data: {
          stressFeelings: form6 ?? null,
          stressCategories: form7 ?? null,
          frequency: form6?.frequency ?? form7?.frequency ?? null,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Stress data saved." });
  } catch (err: any) {
    console.error("Error saving stress data:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
