import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const records = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        name,
        achievement AS title,
        category,
        sub_category AS "subCategory",
        image_url AS "imageUrl",
        TO_CHAR(date_achieved, 'YYYY') AS year,
        description
      FROM second_book_of_record
      WHERE category = 'performance'
      ORDER BY date_achieved DESC
      LIMIT ${limit} OFFSET ${offset};
    `);

    const totalCount: { total: number }[] = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int AS total 
      FROM second_book_of_record
      WHERE category = 'performance';
    `);

    return NextResponse.json({
      data: records,
      total: totalCount[0].total,
      totalPages: Math.ceil(totalCount[0].total / limit),
      page,
    });
  } catch (error) {
    console.error("❌ Error fetching performance records (second book):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
