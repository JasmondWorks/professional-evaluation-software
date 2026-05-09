import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import jwt from 'jsonwebtoken';

type user = {
  id: number;
  name: string;
  email: string;
  password: string;
  gsm: string;
  role: string;
  address: string;
  faculty_college: string;
  dob: string;
  doa: string;
  poa: string;
  doc: string;
  post: string;
  dopp: string;
  level: string;
  image: string;
  org: string;
};

async function getUser(id: number | null, name: string | null) {
  console.log(id, name)
  const users: user[] = await prisma.$queryRawUnsafe(
    'SELECT * FROM pesuser WHERE id = $1 AND org = $2',
    Number(id),
    name
  );

  await prisma.$disconnect();

  if (!users[0]) return null;

  // Convert dates or decimals to string/number
  const u = users[0];
  return {
    ...u,
    dob: u.dob?.toString(),
    doa: u.doa?.toString(),
    poa: u.poa?.toString(),
    doc: u.doc?.toString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { user, org } = await request.json();


    const userInfo = await getUser(user, org);

    if (!userInfo) {
      return NextResponse.json({ data: ['no data'] });
    }

    return NextResponse.json({ data: userInfo });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: ['no data'] });
  }
}
