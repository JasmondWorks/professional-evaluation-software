export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.dev'
import { randomUUID } from "crypto";
import bcrypt from 'bcryptjs';

type reqInfo = {
  name: string
  org: string
  email: string
  password: string
  type: string
  plan: string
  planCode: string
  category: string
  logo: string
}

const amounts = {
  PLN_eowlq7d4cp4r0dp: {code: 'basic', amount: 100},
  PLN_cle5ip7jtxfpj5k: {code:'standard', amount: 200},
  PLN_paglu0ly0z641mm: {code:'premium', amount: 300}
}

type planCodes = keyof typeof amounts

async function addToDb(info: reqInfo) {
  const { name, email, password, type, category, plan, planCode, org, logo } = info;

  // Hash the password before storing — critical for security.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const planDetails = amounts[planCode as keyof typeof amounts] || amounts['PLN_eowlq7d4cp4r0dp'];
  const amount = planDetails.amount;

  // Unique per signup — must not be shared across requests (reference is @unique).
  const reference = `PES_${randomUUID()}`;

  // A transaction keeps org + user + subscription creation atomic.
  return await prisma.$transaction(async (tx) => {
    // Create the org, or return the existing one (matches ON CONFLICT DO NOTHING).
    const orgRecord = await tx.org.upsert({
      where: { name: org },
      update: {},
      create: {
        name: org,
        category,
        plan,
        maintenance_model: category === 'academic',
      },
    });

    const user = await tx.pesuser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: type || 'admin',
        image: logo,
        org,
        category,
        plan,
      },
    });

    await tx.subscriptions_info.create({
      data: {
        pesuser_email: email,
        pesuser_name: name,
        org,
        plan_code: planCode,
        plan_name: plan,
        reference,
        status: 'success',
        amount,
        paid_at: new Date(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, maintenance_model: orgRecord.maintenance_model };
  });
}


export async function GET() {
  return NextResponse.json({ name: 'successful!', data: 'true' })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, org, email, password, type, category, plan, planCode, logo } = body

  // A plan/category must be selected (they come from the pricing page as query
  // params). Guard here so we return a clear 400 instead of a raw NOT NULL crash.
  if (!category || !plan) {
    return NextResponse.json(
      { message: 'Please select a plan before signing up.' },
      { status: 400 },
    );
  }

  try {
    // Check if user exists first to fail fast
    const existing = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const { user, maintenance_model } = await addToDb({
      name, email, password, type, category, plan, planCode, org, logo,
    });

    // Seed the system preset roles for the new org so they exist as real roles.
    try {
      const { seedPresetRoles } = await import('../_lib/seedRoles');
      await seedPresetRoles(org);
    } catch (seedErr) {
      console.error('preset role seeding failed (non-fatal):', seedErr);
    }

    const token = jwt.sign(
      {
        userID: user.id.toString(),
        name: user.name,
        role: user.role,
        org: user.org,
        email: user.email,
        logo: user.image,
        productCategory: user.category,
        productPlan: user.plan,
        maintenance_model: maintenance_model || false,
      },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    );

    return NextResponse.json({ message: 'Login successful!', token, status: 200 });
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message || 'Server Error' }, { status: 500 })
  }
}