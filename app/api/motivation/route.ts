import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import prisma from "../prisma.dev";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwtDecode(token);
    const org = decoded?.org;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    const body = await req.json();
    const {
      total_score,
      rating,
      thresholds,
      categories,
    } = body;

    if (
      total_score === undefined ||
      !rating ||
      !thresholds ||
      !categories
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [record]: any = await prisma.$queryRaw`
      INSERT INTO motivation (
        org, total_score, rating, thresholds, categories
      )
      VALUES (
        ${org},
        ${Number(total_score)},
        ${rating},
        ${JSON.stringify(thresholds)}::jsonb,
        ${JSON.stringify(categories)}::jsonb
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving staff motivation:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
