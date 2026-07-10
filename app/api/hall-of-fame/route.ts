export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

export async function GET() {
  try {
    const rows = await prisma.hall_of_fame.findMany({
      select: {
        id: true,
        name: true,
        title: true,
        image_url: true,
        year: true,
        description: true,
      },
      orderBy: { year: "desc" },
    });

    // Preserve the previous API shape (image_url → imageUrl).
    const hallOfFame = rows.map(({ image_url, ...rest }) => ({
      ...rest,
      imageUrl: image_url,
    }));

    return NextResponse.json(hallOfFame);
  } catch (error) {
    console.error('Error fetching Hall of Fame data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Hall of Fame data' },
      { status: 500 }
    );
  }
}
