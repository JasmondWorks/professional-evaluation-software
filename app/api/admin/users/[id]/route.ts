import prisma from "../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.$executeRawUnsafe(
    `DELETE FROM pesuser WHERE id = $1`,
    Number(params.id)
  );

  return NextResponse.json({ success: true });
}

export async function GET(  req: NextRequest, { params }: { params: { id: string } }) {
    const user: any = await prisma.$queryRawUnsafe(
    `SELECT * FROM pesuser WHERE id = $1`,
    Number(params.id)
  );
  console.log(user)

  return NextResponse.json(user[0]);
}