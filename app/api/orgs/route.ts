export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../_lib/authGuard";
import prisma from "../prisma.dev";


export async function GET(req: NextRequest) {
  try {
    const orgs = await prisma.org.findMany({ select: { id: true, name: true } });
    return NextResponse.json(orgs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orgs" }, { status: 500 });
  }
}
