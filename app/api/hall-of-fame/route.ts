import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

export async function GET() {
  try {
    const hallOfFame = await prisma.$queryRawUnsafe(`
      SELECT 
        id, 
        name, 
        title, 
        image_url AS "imageUrl", 
        year, 
        description
      FROM hall_of_fame
      ORDER BY year DESC
    `);

    return NextResponse.json(hallOfFame);
  } catch (error) {
    console.error('Error fetching Hall of Fame data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Hall of Fame data' },
      { status: 500 }
    );
  }
}
