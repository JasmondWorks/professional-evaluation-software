import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { jwtDecode } from 'jwt-decode';

async function getUser(id: number | null, name: string | null) {
  if (id === null || name === null) return null;

  const u = await prisma.pesuser.findFirst({
    where: { id: Number(id), org: name },
  });

  if (!u) return null;

  // Convert dates or decimals to string/number
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
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let org;
    try {
      const decoded: any = jwtDecode(token);
      org = decoded?.org;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const { user } = await request.json();


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
