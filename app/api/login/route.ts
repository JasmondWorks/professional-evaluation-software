

import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const user = await prisma.pesuser.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 🔐 Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Fetch admin logo in same org
    const admin = await prisma.pesuser.findFirst({
      where: {
        role: 'admin',
        org: user.org
      },
      select: { image: true }
    });

    const m_model: boolean[] = await prisma.$queryRaw`
      SELECT maintenance_model
      FROM org
      WHERE name = ${user.org}
      LIMIT 1;
    `;

    const maintenance = m_model[0];

    const logo = admin?.image || user.image || null;

    const token = jwt.sign(
      {
        userID: user.id,
        name: user.name,
        role: user.role,
        org: user.org,
        email: user.email,
        logo,
        dept: user.dept,
        productCategory: user.category,
        productPlan: user.plan,
        maintenance_model: maintenance.maintenance_model 
      },
      'oti'
    );
    console.log('login successful')

    return NextResponse.json({
      message: "Login successful!",
      token,
      role: user.role,
      status: 200
    }, {status: 200});

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}