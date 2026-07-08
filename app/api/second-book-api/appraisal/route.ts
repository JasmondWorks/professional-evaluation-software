import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const [records, total] = await Promise.all([
      prisma.second_book_of_record.findMany({
        where: { category: "appraisal" },
        orderBy: { date_achieved: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.second_book_of_record.count({ where: { category: "appraisal" } }),
    ]);

    const data = records.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.achievement,
      category: r.category,
      subCategory: r.sub_category,
      imageUrl: r.image_url,
      year: r.date_achieved ? new Date(r.date_achieved).getFullYear().toString() : null,
      description: r.description,
    }));

    return NextResponse.json({
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error("❌ Error fetching appraisal records (second book):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
