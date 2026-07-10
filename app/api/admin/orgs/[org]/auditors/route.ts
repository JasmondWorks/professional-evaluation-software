export const dynamic = "force-dynamic";
import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  const auditors = await prisma.pesuser.findMany({
    where: { org: params.org, role: "auditor" },
    select: { id: true, name: true, email: true, role: true, org: true },
  });

  return NextResponse.json(auditors);
}