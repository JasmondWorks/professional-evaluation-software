import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const auditors = await prisma.$queryRawUnsafe(
    `SELECT *
     FROM pesuser
     WHERE role = 'auditor'`
  );

  return NextResponse.json(auditors);
}