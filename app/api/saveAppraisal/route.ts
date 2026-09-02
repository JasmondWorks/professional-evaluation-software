import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt';
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
    jwt.verify(token, getJWTSecret())

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

    // The appraisal tables store evaluation scores as individual columns, so
    // spread numericData (keyed by column name) into the row rather than a blob.
    const delegate: any = isCounter ? prisma.counter_appraisal : prisma.appraisal;
    const values = { ...numericData, dept: dept || null };

    // Upsert on (pesuser_name, org) via constraint-independent find-then-write.
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
