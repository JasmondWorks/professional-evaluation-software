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
      section,
      result,
      numerator = [],
      denominator = [],
      extra_data = {},
    } = body;

    if (!section || result === undefined || result === null) {
      return NextResponse.json(
        { error: "Missing required fields (section or result)" },
        { status: 400 }
      );
    }

    // Construct properly typed arrays
    const numArray = `{${numerator.map(Number).join(",")}}`;
    const denArray = `{${denominator.map(Number).join(",")}}`;

    // Use proper casting for numeric[]
    const [record]: any = await prisma.$queryRaw`
      INSERT INTO org_structure_results (
        org, section, result, numerator, denominator, extra_data
      )
      VALUES (
        ${org},
        ${Number(section)},
        ${Number(result)},
        ${numArray}::numeric[],
        ${denArray}::numeric[],
        ${JSON.stringify(extra_data)}::jsonb
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving org structure result:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
