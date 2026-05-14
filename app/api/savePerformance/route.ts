import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import jwt from 'jsonwebtoken';
import { validateData, savePerformanceSchema, formatZodErrors } from '@/app/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify JWT token from body
    const token = body.token || body.access_token
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production')

    // Validate input
    const validation = validateData(savePerformanceSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      );
    }

    const { pesuser_name, org, dept, isCounter, payload: performanceData } = validation.data!;

    // Convert payload values to numbers
    const competence = parseFloat(String(performanceData.competence));
    const integrity = parseFloat(String(performanceData.integrity));
    const compatibility = parseFloat(String(performanceData.compatibility));
    const use_of_resources = parseFloat(String(performanceData.use_of_resources));

    // Validate numeric values
    if (isNaN(competence) || isNaN(integrity) || isNaN(compatibility) || isNaN(use_of_resources)) {
      return NextResponse.json(
        { error: 'All performance values must be valid numbers' },
        { status: 400 }
      );
    }

    if (isCounter) {
      // Save counter performance (HOD scores)
      await prisma.$executeRaw`
        INSERT INTO counteruserperformance (pesuser_name, org, dept, competence, integrity, compatibility, use_of_resources)
        VALUES (${pesuser_name}, ${org}, ${dept || null}, ${competence}, ${integrity}, ${compatibility}, ${use_of_resources})
        ON CONFLICT (pesuser_name, org)
        DO UPDATE SET
          competence = ${competence},
          integrity = ${integrity},
          compatibility = ${compatibility},
          use_of_resources = ${use_of_resources},
          dept = ${dept || null}
      `;
    } else {
      // Save regular performance (employee scores)
      await prisma.$executeRaw`
        INSERT INTO userperformance (pesuser_name, org, dept, competence, integrity, compatibility, use_of_resources)
        VALUES (${pesuser_name}, ${org}, ${dept || null}, ${competence}, ${integrity}, ${compatibility}, ${use_of_resources})
        ON CONFLICT (pesuser_name, org)
        DO UPDATE SET
          competence = ${competence},
          integrity = ${integrity},
          compatibility = ${compatibility},
          use_of_resources = ${use_of_resources},
          dept = ${dept || null}
      `;
    }

    return NextResponse.json(
      { message: 'Performance data saved successfully', status: 200 },
      { status: 200 }
    );

  } catch (err) {
    console.error('Error saving performance:', err);
    return NextResponse.json(
      { error: 'Failed to save performance data' },
      { status: 500 }
    );
  }
}
