import { NextResponse } from "next/server";
import prisma from "@/app/api/prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let org;
    try {
      const decoded: any = jwtDecode(token);
      org = decoded?.org;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const { pesuser_name, responses } = await req.json();

    if (!pesuser_name || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    await prisma.auditor_survey_responses.createMany({
      data: responses.map((r: { section: string; question: string; response: string }) => ({
        pesuser_name,
        org,
        section: r.section,
        question: r.question,
        response: r.response,
      })),
    });

    return NextResponse.json({ success: true, message: "Survey saved successfully" });
  } catch (err) {
    console.error("Error saving survey:", err);
    return NextResponse.json({ error: "Failed to save survey" }, { status: 500 });
  }
}
