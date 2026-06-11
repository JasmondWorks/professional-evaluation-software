import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

type reqInfo = {
  email: string
  password: string
}

async function getUser(info: reqInfo) {
  const { email, password } = info
  const users = await prisma.$queryRaw`
    SELECT * 
    FROM pesuser 
    WHERE email = ${email};
  ` as any[];

  if (users.length === 0) {
    return [];
  }

  const user = users[0];
  const isBcrypt = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));
  
  let isMatch = false;
  if (isBcrypt) {
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = false;
    }
  } else {
    isMatch = password === user.password;
  }

  if (isMatch) {
    return [user];
  }
  return [];
}


export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const data = await getUser({ email, password });

    if (data.length === 0) {
      return NextResponse.json({ message: "Invalid credentials", status: 500 });
    }

    const user = data[0];

    const token = jwt.sign(
      {
        userID: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      'oti'
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
  } finally {
    // Close Prisma AFTER all queries
    await prisma.$disconnect();
  }
}
