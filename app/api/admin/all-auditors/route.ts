import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const auditors = await prisma.pesuser.findMany({ where: { role: "auditor" } });

  return NextResponse.json(auditors);
}