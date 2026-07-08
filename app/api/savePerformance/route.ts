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

    // Pick the correct model (counter_userperformance for HOD scores).
    const delegate: any = isCounter
      ? prisma.counter_userperformance
      : prisma.userperformance;

    const values = {
      competence,
      integrity,
      compatibility,
      use_of_resources,
      dept: dept || null,
    };

    // Upsert on (pesuser_name, org). No unique constraint spans exactly those two
    // columns, so do a constraint-independent find-then-write.
    const existing = await delegate.findFirst({
      where: { pesuser_name, org },
      select: { id: true },
    });

    if (existing) {
      await delegate.updateMany({ where: { pesuser_name, org }, data: values });
    } else {
      await delegate.create({ data: { pesuser_name, org, ...values } });
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
