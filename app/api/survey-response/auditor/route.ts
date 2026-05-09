import { NextResponse } from "next/server";
import prisma from "@/app/api/prisma.dev";

export async function POST(req: Request) {
  try {
    const { pesuser_name, org, responses } = await req.json();

    if (!pesuser_name || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Loop through each response and insert individually (still queryRaw)
    for (const r of responses) {
      await prisma.$queryRawUnsafe(`
        INSERT INTO auditor_survey_responses 
        (pesuser_name, org, section, question, response)
        VALUES ('${pesuser_name}', '${org}', '${r.section}', '${r.question}', '${r.response}');
      `);
    }

    return NextResponse.json({ success: true, message: "Survey saved successfully" });
  } catch (err) {
    console.error("Error saving survey:", err);
    return NextResponse.json({ error: "Failed to save survey" }, { status: 500 });
  }
}
