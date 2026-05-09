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

    // Combine both forms into one JSON summary
    const stress_theme = JSON.stringify({
      stressFeelings: form6,
      stressCategories: form7,
    });

    // You can also calculate an average feeling frequency or theme keyword
    const stress_feeling_frequency =
      form6?.frequency || form7?.frequency || "N/A";

    // Save record using queryRaw
    await prisma.$queryRaw`
      INSERT INTO stress (pesuser_name, org, stress_theme, stress_feeling_frequency, dept)
      VALUES (${pesuser_name}, ${org}, ${stress_theme}, ${stress_feeling_frequency}, ${dept})
    `;

    return NextResponse.json({ success: true, message: "Stress data saved." });
  } catch (err: any) {
    console.error("Error saving stress data:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
