export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { verifyToken } from "../_lib/authGuard";

// ✅ GET: Fetch all results (optionally by mode)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const results = await prisma.optimizationResult.findMany({
    where: { 
      org: decoded.org,
      ...(mode ? { mode } : {})
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(results);
}

// ✅ POST: Insert new result
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

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

  const result = await prisma.optimizationResult.create({
    data: {
      mode,
      optimalK,
      efficiencyValue: efficiencyValue ?? 0,
      totalStaffNeeded,
      supervisoryStaff: supervisoryStaff ?? 0,
      managementLevel1: managementStaffLevel1 ?? 0,
      managementLevel2: managementStaffLevel2 ?? 0,
      topManagementStaff: topManagementStaff ?? 0,
      lecturers: staffDistribution.lecturers ?? 0,
      seniorLecturers: staffDistribution.seniorLecturers ?? 0,
      professors: staffDistribution.professors ?? 0,
      studentPopulation: studentPopulation ?? 0,
      D: D ?? null,
      G: G ?? null,
      Y: Y ?? null,
      alpha: alpha ?? null,
      t1: t1 ?? null,
      t2: t2 ?? null,
      t3: t3 ?? null,
      t4: t4 ?? null,
      S0: S0 ?? null,
      org: decoded.org,
    },
  });

  return NextResponse.json(result);
}
