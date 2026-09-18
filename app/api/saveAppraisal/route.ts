import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize } from '../_lib/authGuard';
import { validateData, saveAppraisalSchema, formatZodErrors } from '@/app/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify JWT token from body
    const token = body.token || body.access_token
    const auth = authorize(token, { anyOf: ['can_access_employee_data'] });
    if (!auth.ok) return auth.response;

    // Validate input
    const validation = validateData(saveAppraisalSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      );
    }

    const { pesuser_name, dept, isCounter, payload: appraisalData } = validation.data!;
    // The org this write lands in comes from the verified token, never the
    // body — `org` is a display string, but trusting a client-supplied value
    // here would let any authenticated user overwrite another org's scores.
    const org = auth.user.org;
    if (!org) {
      return NextResponse.json({ error: 'No organization on this account.' }, { status: 400 });
    }

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
