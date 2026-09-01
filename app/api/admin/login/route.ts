import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { validateData, loginSchema, formatZodErrors } from '@/app/lib/validation'

// Tiers allowed through the platform console login.
const PLATFORM_TIERS = ['super-admin', 'admin'];

type reqInfo = {
  email: string
  password: string
}

async function getUser(info: reqInfo) {
  const { email, password } = info
  const user = await prisma.pesuser.findUnique({ where: { email } });

  if (!user) {
    return [];
  }

  // Only bcrypt. The old code fell back to `password === user.password` for any
  // row whose hash did not start with $2a/$2b/$2y, which meant a legacy plaintext
  // row was still a valid credential.
  let isMatch = false;
  try {
    isMatch = await bcrypt.compare(password, user.password);
  } catch {
    isMatch = false;
  }

  // This is the console login, not the tenant one. A non-platform account that
  // authenticates here used to walk away with a token claiming admin.
  if (isMatch && PLATFORM_TIERS.includes(user.role ?? '')) {
    return [user];
  }
  return [];
}


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

  try {
    const data = await getUser({ email, password });

    if (data.length === 0) {
      return NextResponse.json({ message: "Invalid credentials", status: 500 });
    }

    const user = data[0];

    // Was signed with the literal 'oti', which is both a secret committed to the
    // repo and a secret nothing else verifies with — so the token this route
    // issued was rejected by every guarded route it was meant to open.
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set; refusing to issue a token.');
      return NextResponse.json({ message: 'Server auth is not configured.' }, { status: 500 });
    }

    const token = jwt.sign(
      {
        userID: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        org: user.org,
      },
      secret,
      { expiresIn: '15m' }
    );

    return NextResponse.json({
      message: "Login successful!",
      token,
      role: user.role,
      status: 200,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Invalid credentials", status: 500 });
  }
}
