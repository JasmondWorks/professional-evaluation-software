// Shared auth for the performance routes. These VERIFY the token rather than
// merely decoding it, as the appraisal routes do: org scoping is derived from a
// verified claim, so a hand-crafted token cannot reach another org's data.
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { PerformanceError, Viewer } from '@/app/lib/performance/service';

export function viewerFrom(req: Request): Viewer {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new PerformanceError('Sign in to continue.', 401);

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new PerformanceError('Server auth is not configured.', 500);

  let claims: any;
  try {
    claims = jwt.verify(token, secret);
  } catch {
    throw new PerformanceError('Your session has expired. Sign in again.', 401);
  }
  if (!claims?.org) {
    throw new PerformanceError('This account is not attached to an organization.', 403);
  }

  return {
    org: claims.org,
    name: claims.name,
    role: claims.role,
    dept: claims.dept ?? null,
    productCategory: claims.productCategory ?? claims.category ?? null,
  };
}

export function fail(err: unknown) {
  if (err instanceof PerformanceError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error('performance route error:', err);
  return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
}
