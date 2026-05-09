// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const AUDITOR_PATHS = ['/auditor', '/api/auditor'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  if (!AUDITOR_PATHS.some(p => url.pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get('access_token')?.value 
             || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const decoded: any = jwt.decode(token); // or jwt.verify(token, process.env.JWT_SECRET!)
    if (decoded?.role !== 'auditor') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    // Optionally attach to request headers for API handlers
    const res = NextResponse.next();
    res.headers.set('x-user-id', decoded.id);
    res.headers.set('x-user-role', decoded.role);
    return res;
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/auditor/:path*', '/api/auditor/:path*'],
};