// Shared auth for the appraisal routes. Unlike most existing routes, which call
// jwtDecode (no signature check), these verify the token. Org scoping is derived
// from a verified claim, so a hand-crafted token cannot reach another org's data.
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { AppraisalError, Viewer } from '@/app/lib/appraisal/service';

export function viewerFrom(req: Request): Viewer {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppraisalError('Sign in to continue.', 401);

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppraisalError('Server auth is not configured.', 500);

  let claims: any;
  try {
    claims = jwt.verify(token, secret);
  } catch {
    throw new AppraisalError('Your session has expired. Sign in again.', 401);
  }
  if (!claims?.org) throw new AppraisalError('This account is not attached to an organization.', 403);

  return { org: claims.org, name: claims.name, role: claims.role, dept: claims.dept ?? null };
}

export function fail(err: unknown) {
  if (err instanceof AppraisalError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error('appraisal route error:', err);
  return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
}
