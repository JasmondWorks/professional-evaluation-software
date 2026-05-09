import prisma from "../../prisma.dev";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.$queryRawUnsafe(`
    SELECT org, json_agg(pesuser.*) AS users
    FROM pesuser
    GROUP BY org
    ORDER BY org
  `);

  return NextResponse.json(data);
}