import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    const [first, second, hall, badges] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT *, 'first_book' AS source FROM first_book_of_record WHERE name = ${name}
      `,
      prisma.$queryRaw<any[]>`
        SELECT *, 'second_book' AS source FROM second_book_of_record WHERE name = ${name}
      `,
      prisma.$queryRaw<any[]>`
        SELECT *, 'hall_of_fame' AS source FROM hall_of_fame WHERE name = ${name}
      `,
      prisma.$queryRaw<any[]>`
        SELECT *, 'badges' AS source FROM badges WHERE name = ${name}
      `
    ]);

    // Map sources to URLs
    const mapWithUrl = (items: any[], type: string) => {
      return items.map(item => {
        let url = "";
        switch (type) {
          case "first_book":
            url = "/book-of-record";
            break;
          case "second_book":
            url = "/book-of-record/second";
            break;
          case "hall_of_fame":
            url = "/hall-of-fame";
            break;
          case "badges":
            url = `/reward/badges/${name}`;
            break;
        }
        return { ...item, url };
      });
    };

    const results = [
      ...mapWithUrl(first, "first_book"),
      ...mapWithUrl(second, "second_book"),
      ...mapWithUrl(hall, "hall_of_fame"),
      ...mapWithUrl(badges, "badges")
    ];

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Error fetching achievements:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

