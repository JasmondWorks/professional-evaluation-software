import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwtDecode<{ org: string }>(token);
    const org = decoded.org;

    const body = await req.json()
    const { pesuser_name, competence, integrity, compatibility, use_of_resources } = body

    // Required fields
    if (!pesuser_name || !org) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Fetch dept from pesuser
    const user = await prisma.pesuser.findFirst({
      where: { name: pesuser_name, org },
      select: { dept: true },
    })

    if (!user?.dept) {
      return NextResponse.json({ message: 'User not found or department missing' }, { status: 404 })
    }

    const dept = user.dept

    // Insert or update into userperformance
    await prisma.userperformance.upsert({
      where: { pesuser_name_org_dept: { pesuser_name, org, dept } },
      update: {
        competence: competence ?? null,
        integrity: integrity ?? null,
        compatibility: compatibility ?? null,
        use_of_resources: use_of_resources ?? null,
      },
      create: {
        pesuser_name,
        org,
        dept,
        competence: competence ?? null,
        integrity: integrity ?? null,
        compatibility: compatibility ?? null,
        use_of_resources: use_of_resources ?? null,
      },
    })

    return NextResponse.json({ message: 'userperformance saved/updated' }, { status: 200 })
  } catch (error) {
    console.error('Prisma query error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
