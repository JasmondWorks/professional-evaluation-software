import { NextResponse } from 'next/server'
import { getJWTSecret, getRefreshSecret } from '@/app/lib/jwt';
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'
import { compactPermissions } from '@/app/components/utils/roles'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token provided" }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      getRefreshSecret()
    );

    const user = await prisma.pesuser.findUnique({
      where: { id: decoded.userID }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
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

    const newAccessToken = jwt.sign(
      payload,
      getJWTSecret(),
      { expiresIn: '15m' }
    );

    return NextResponse.json({
      message: "Token refreshed successfully",
      token: newAccessToken,
      role: user.role
    }, { status: 200 });

  } catch (err) {
    console.error("TOKEN REFRESH ERROR:", err);
    return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
  }
}
