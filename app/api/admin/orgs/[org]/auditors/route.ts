import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  const auditors = await prisma.$queryRawUnsafe(
    `SELECT id, name, email, role, org
     FROM pesuser
     WHERE org = $1 AND role = 'auditor'`,
    params.org
  );

  return NextResponse.json(auditors);
}