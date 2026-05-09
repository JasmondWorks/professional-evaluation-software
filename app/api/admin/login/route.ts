import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import jwt from 'jsonwebtoken'

type reqInfo = {
  email: string
  password: string
}

async function getUser(info: reqInfo) {
  const { email, password } = info
  const users = await prisma.$queryRaw`
    SELECT * 
    FROM pesuser 
    WHERE email = ${email} 
      AND password = ${password};
  `;

  return users as any[];
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
