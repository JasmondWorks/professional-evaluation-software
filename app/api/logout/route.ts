import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

  // Clear the refresh token cookie
  response.cookies.set({
    name: 'refresh_token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  // Clear the role cookie
  response.cookies.set({
    name: 'role',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
