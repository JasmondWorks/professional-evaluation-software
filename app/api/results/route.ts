import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

// ✅ GET: Fetch all results (optionally by mode)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  let results;

  if (mode) {
    results = await prisma.$queryRawUnsafe(
      `SELECT * FROM "OptimizationResult" WHERE mode = $1 ORDER BY "createdAt" DESC`,
      mode
    );
  } else {
    results = await prisma.$queryRawUnsafe(
      `SELECT * FROM "OptimizationResult" ORDER BY "createdAt" DESC`
    );
  }

  return NextResponse.json(results);
}

// ✅ POST: Insert new result
export async function POST(req: Request) {
  const data = await req.json();

  if (!data.mode || !data.optimalK || !data.totalStaffNeeded) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const {
    mode,
    optimalK,
    efficiencyValue,
    totalStaffNeeded,
    supervisoryStaff,
    managementStaffLevel1,
    managementStaffLevel2,
    topManagementStaff,
    staffDistribution = {},
    studentPopulation,
    D,
    G,
    Y,
    alpha,
    t1,
    t2,
    t3,
    t4,
    S0,
  } = data;

  const result: any[] = await prisma.$queryRawUnsafe(
    `
    INSERT INTO "OptimizationResult" (
      mode, "optimalK", "efficiencyValue", "totalStaffNeeded",
      "supervisoryStaff", "managementLevel1", "managementLevel2",
      "topManagementStaff", "lecturers", "seniorLecturers", "professors",
      "studentPopulation", "D", "G", "Y", "alpha", "t1", "t2", "t3", "t4", "S0"
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
    )
    RETURNING *;
    `,
    mode,
    optimalK,
    efficiencyValue ?? 0,
    totalStaffNeeded,
    supervisoryStaff ?? 0,
    managementStaffLevel1 ?? 0,
    managementStaffLevel2 ?? 0,
    topManagementStaff ?? 0,
    staffDistribution.lecturers ?? 0,
    staffDistribution.seniorLecturers ?? 0,
    staffDistribution.professors ?? 0,
    studentPopulation ?? 0,
    D ?? null,
    G ?? null,
    Y ?? null,
    alpha ?? null,
    t1 ?? null,
    t2 ?? null,
    t3 ?? null,
    t4 ?? null,
    S0 ?? null
  );

  return NextResponse.json(result[0]);
}
