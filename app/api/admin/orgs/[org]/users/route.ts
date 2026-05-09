import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  try {
    const users = await prisma.$queryRawUnsafe(
      `SELECT * FROM pesuser WHERE org = $1 ORDER BY name`,
      params.org
    );
    console.log(users)

    return NextResponse.json(users);    
  } catch (error) {
    console.log(error)
  }
}