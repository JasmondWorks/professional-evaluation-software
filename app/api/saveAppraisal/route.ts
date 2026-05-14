import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import jwt from 'jsonwebtoken';
import { validateData, saveAppraisalSchema, formatZodErrors } from '@/app/lib/validation';

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
    const validation = validateData(saveAppraisalSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      );
    }

    const { pesuser_name, org, dept, isCounter, payload: appraisalData } = validation.data!;

    // Convert all payload values to numbers
    const numericData: Record<string, number> = {};
    for (const [key, value] of Object.entries(appraisalData)) {
      const numValue = parseFloat(String(value));
      if (isNaN(numValue)) {
        return NextResponse.json(
          { error: `Invalid numeric value for ${key}` },
          { status: 400 }
        );
      }
      numericData[key] = numValue;
    }

    if (isCounter) {
      // Save counter appraisal (HOD scores)
      await prisma.$executeRaw`
        INSERT INTO counterappraisal (pesuser_name, org, dept, payload)
        VALUES (${pesuser_name}, ${org}, ${dept || null}, ${JSON.stringify(numericData)}::jsonb)
        ON CONFLICT (pesuser_name, org)
        DO UPDATE SET
          payload = ${JSON.stringify(numericData)}::jsonb,
          dept = ${dept || null}
      `;
    } else {
      // Save regular appraisal (employee scores)
      await prisma.$executeRaw`
        INSERT INTO appraisal (pesuser_name, org, dept, payload)
        VALUES (${pesuser_name}, ${org}, ${dept || null}, ${JSON.stringify(numericData)}::jsonb)
        ON CONFLICT (pesuser_name, org)
        DO UPDATE SET
          payload = ${JSON.stringify(numericData)}::jsonb,
          dept = ${dept || null}
      `;
    }

    return NextResponse.json(
      { message: 'Appraisal data saved successfully', status: 200 },
      { status: 200 }
    );

  } catch (err) {
    console.error('Error saving appraisal:', err);
    return NextResponse.json(
      { error: 'Failed to save appraisal data' },
      { status: 500 }
    );
  }
}
