// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  ModelAccessError,
  ModelViewer,
  accessForViewer,
  accessMatrix,
  isModelAdmin,
  setModelAccess,
} from '@/app/lib/models/access';
import { MODEL_CATALOG, MODEL_DATA_ENTRY_ROLE } from '@/app/lib/models/catalog';

function viewerFrom(req: Request): ModelViewer {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ModelAccessError('Sign in to continue.', 401);

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ModelAccessError('Server auth is not configured.', 500);

  let claims: any;
  try {
    claims = jwt.verify(token, secret);
  } catch {
    throw new ModelAccessError('Your session has expired. Sign in again.', 401);
  }
  if (!claims?.org) {
    throw new ModelAccessError('This account is not attached to an organization.', 403);
  }
  return { org: claims.org, role: claims.role, name: claims.name };
}

function fail(err: unknown) {
  if (err instanceof ModelAccessError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error('model-access route error:', err);
  // Outside production the real message is far more use than "try again" — this
  // is an admin-only route, so there is nothing here worth hiding from a
  // developer looking at their own machine.
  const detail = process.env.NODE_ENV === 'production' ? undefined : (err as Error)?.message;
  return NextResponse.json(
    { error: detail ? `Something went wrong: ${detail}` : 'Something went wrong. Try again.' },
    { status: 500 },
  );
}

/** `?scope=manage` returns the grid the admin edits. Without it, the caller's own
 *  access — which is what the sidebar and the models page render from, so that
 *  what a person sees and what the server will allow are the same list. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const url = new URL(req.url);

    if (url.searchParams.get('scope') === 'manage') {
      if (!isModelAdmin(viewer.role)) {
        return NextResponse.json(
          { error: 'Only the organization administrator can see model access.' },
          { status: 403 },
        );
      }
      const role = url.searchParams.get('role') ?? MODEL_DATA_ENTRY_ROLE;
      return NextResponse.json({ role, catalog: MODEL_CATALOG, access: await accessMatrix(viewer.org, role) });
    }

    return NextResponse.json({ ...(await accessForViewer(viewer)), catalog: MODEL_CATALOG });
  } catch (err) { return fail(err); }
}

/** Switch one model on or off for a role. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    const access = await setModelAccess(viewer, {
      role: body.role,
      model: body.model,
      enabled: !!body.enabled,
    });
    return NextResponse.json({ access });
  } catch (err) { return fail(err); }
}
