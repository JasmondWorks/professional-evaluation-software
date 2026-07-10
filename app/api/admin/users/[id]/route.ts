export const dynamic = "force-dynamic";
import prisma from "../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.pesuser.deleteMany({ where: { id: Number(params.id) } });

  return NextResponse.json({ success: true });
}

export async function GET(  req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.pesuser.findUnique({
    where: { id: Number(params.id) },
  });

  return NextResponse.json(user);
}