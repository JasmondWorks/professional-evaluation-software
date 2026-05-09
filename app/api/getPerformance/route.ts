import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwtDecode(token);
    const org = decoded?.org;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    // Fetch user performance for this org
    const results: any[] = await prisma.$queryRaw`
      SELECT competence, integrity, compatibility, "use_of_resources"
      FROM userperformance
      WHERE org = ${org}
    `;

    // Transform rows into grouped arrays by category
    const grouped = {
      competence: results.map(r => Number(r.competence) || 0),
      integrity: results.map(r => Number(r.integrity) || 0),
      compatibility: results.map(r => Number(r.compatibility) || 0),
      useOfResources: results.map(r => Number(r.use_of_resources) || 0),
    };

    return NextResponse.json(grouped, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching performance data:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
