

import { NextResponse } from 'next/server'
import { getJWTSecret, getRefreshSecret } from '@/app/lib/jwt';
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { compactPermissions } from '@/app/components/utils/roles'
import { validateData, loginSchema, formatZodErrors } from '@/app/lib/validation'

// Deliberately public: this is where a session begins, so there is no token to
// check yet.
export async function POST(req: Request) {
  const body = await req.json();
  
  const validation = validateData(loginSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Validation failed", details: formatZodErrors(validation.errors!) },
      { status: 400 }
    );
  }

  const { email, password } = validation.data!;
  const remember = body.remember;

  try {
    const cleanEmail = email.trim();
    const user = await prisma.pesuser.findFirst({
      where: { 
        email: { equals: cleanEmail, mode: 'insensitive' } 
      }
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Trim the password: emailed credentials are easily pasted with a trailing
    // space/newline (the credentials email even warns about it), which would
    // otherwise fail even though the password is correct.
    const cleanPassword = typeof password === 'string' ? password.trim() : password;

    // Some rows still hold their password as plain text, from before hashing
    // existed here. Simply dropping the comparison would lock those people out,
    // so the plaintext match stays — but a row that matches this way is hashed
    // on the spot, so each such login drains one more of them and the branch can
    // eventually go. Nothing is ever written back in plain text.
    const isBcrypt = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));
    let isMatch = false;
    if (isBcrypt) {
      isMatch = await bcrypt.compare(cleanPassword, user.password);
    } else {
      isMatch = cleanPassword === user.password;
      if (isMatch) {
        await prisma.pesuser.update({
          where: { id: user.id },
          data: { password: await bcrypt.hash(cleanPassword, 10) },
        });
        console.log('Migrated a plaintext password to bcrypt on login:', user.email);
      }
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

    const payload = {
      userID: user.id,
      name: user.name,
      role: user.role,
      displayRole: user.display_role || user.role,
      org: user.org,
      email: user.email,
      logo,
      dept: user.dept,
      productCategory: user.category,
      productPlan: user.plan,
      maintenance_model: maintenance?.maintenance_model ?? false,
      perms
    };

    const accessToken = jwt.sign(
      payload,
      getJWTSecret(),
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userID: user.id },
      getRefreshSecret(),
      { expiresIn: remember ? '30d' : '1d' }
    );

    console.log('login successful');

    const response = NextResponse.json({
      message: "Login successful!",
      token: accessToken,
      role: user.role,
      status: 200
    }, { status: 200 });

    response.cookies.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember ? 30 * 24 * 60 * 60 : undefined, // Session cookie if remember is false
      path: '/',
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}