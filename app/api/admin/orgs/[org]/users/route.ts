import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  try {
    const users = await prisma.pesuser.findMany({
      where: { org: params.org },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.log(error)
  }
}