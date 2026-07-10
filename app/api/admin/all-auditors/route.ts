import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  const auditors = await prisma.pesuser.findMany({ where: { role: "auditor" } });

  return NextResponse.json(auditors);
}