import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    let whereClause = "";
    if (name) whereClause = `WHERE pesuser_name = '${name.replace(/'/g, "''")}'`;

    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT pesuser_name, dept, stress_theme, stress_feeling_frequency
      FROM counter_stress ${whereClause};
    `);

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching counter stress:", err);
    return NextResponse.json({ error: "Failed to fetch counter stress" }, { status: 500 });
  }
}