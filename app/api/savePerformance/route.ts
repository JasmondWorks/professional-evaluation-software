import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pesuser_name, org, payload, isCounter = false } = body;

    if (!pesuser_name || !org || !payload || Object.keys(payload).length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields or empty payload' },
        { status: 400 }
      );
    }

    // Fetch dept from pesuser
    const userResult = await prisma.$queryRawUnsafe<{ dept: string }[]>(
      `SELECT dept FROM "pesuser" WHERE name = $1 AND org = $2 LIMIT 1`,
      pesuser_name,
      org
    );

    if (userResult.length === 0 || !userResult[0].dept) {
      return NextResponse.json(
        { message: 'User not found or department missing' },
        { status: 404 }
      );
    }

    const dept = userResult[0].dept;
    const targetTable = isCounter ? "counter_userperformance" : "userperformance";

    // Build dynamic query from payload
    const columns = Object.keys(payload);
    const values = Object.values(payload);

    const columnNames = columns.map((c) => `"${c}"`).join(", ");
    const placeholders = columns.map((_, i) => `$${i + 4}`).join(", ");

    let query = `
      INSERT INTO "${targetTable}" (pesuser_name, org, dept, ${columnNames})
      VALUES ($1, $2, $3, ${placeholders})
    `;

    if (!isCounter) {
      const updates = columns
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .join(", ");
      query += ` ON CONFLICT (pesuser_name, org, dept) DO UPDATE SET ${updates}`;
    }

    await prisma.$executeRawUnsafe(query, pesuser_name, org, dept, ...values);

    return NextResponse.json(
      { message: `${isCounter ? "Counter userperformance" : "Userperformance"} saved/updated` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Prisma query error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
