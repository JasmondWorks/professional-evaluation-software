

import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { compactPermissions } from '@/app/components/utils/roles'

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const user = await prisma.pesuser.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Compare hashed password (with fallback to plain text if not bcrypt)
    const isBcrypt = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));
    let isMatch = false;
    if (isBcrypt) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

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

    const maintenance = user.org
      ? await prisma.org.findUnique({
          where: { name: user.org },
          select: { maintenance_model: true },
        })
      : null;

    const logo = admin?.image || user.image || null;

    // Embed the user's granted capabilities so the client can gate UI on
    // permissions (which work for any role) rather than the role name alone.
    const permissionRow = await prisma.permission.findFirst({
      where: { user_id: String(user.id) },
    });
    const perms = compactPermissions(permissionRow);

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
        maintenance_model: maintenance?.maintenance_model ?? false,
        perms
      },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    );
    console.log('login successful')

    return NextResponse.json({
      message: "Login successful!",
      token,
      role: user.role,
      status: 200
    }, { status: 200 });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}