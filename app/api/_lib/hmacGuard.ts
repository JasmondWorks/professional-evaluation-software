/** Verifying a signed server-to-server request. SERVER ONLY.
 *
 *  The storefront and PES share one secret. A valid signature over the body
 *  proves the caller holds it, which is the whole of the authentication — an
 *  additional API key would be a second bearer token, weaker than the
 *  signature it sits next to, and would prove nothing the signature does not.
 *
 *  Headers:
 *    X-Timestamp  unix seconds
 *    X-Signature  sha256=<hex of HMAC-SHA256(secret, timestamp + "." + rawBody)>
 *
 *  The signature covers the timestamp as well as the body, so a captured
 *  request cannot be replayed later with a fresh timestamp.
 */

import crypto from 'crypto';
import { NextResponse } from 'next/server';

/** How far a caller's clock may be out. Long enough for a slow request and
 *  ordinary NTP drift, short enough that a captured request is useless by the
 *  time anyone has it. */
const MAX_SKEW_SECONDS = 5 * 60;

export type SignedBody = { ok: true; raw: string } | { ok: false; response: NextResponse };

function refuse(message: string, status: number): { ok: false; response: NextResponse } {
  return { ok: false, response: NextResponse.json({ ok: false, error: message }, { status }) };
}

/** Read and verify the body of a signed request.
 *
 *  Returns the RAW body, deliberately: the signature is over exact bytes, so
 *  the caller must parse this string rather than call req.json() separately.
 *  Re-serialising a parsed object changes whitespace and key order and the
 *  signature would never match again.
 */
export async function verifySignedRequest(req: Request): Promise<SignedBody> {
  const secret = process.env.PROVISION_HMAC_SECRET;
  if (!secret) {
    // A missing secret is a broken deployment, not an open door.
    console.error('PROVISION_HMAC_SECRET is not set; refusing every provisioning request.');
    return refuse('This endpoint is not configured.', 503);
  }

  const timestamp = req.headers.get('x-timestamp');
  const signature = req.headers.get('x-signature');
  if (!timestamp || !signature) {
    return refuse('Missing X-Timestamp or X-Signature.', 401);
  }

  const sent = Number(timestamp);
  if (!Number.isFinite(sent)) return refuse('X-Timestamp is not a unix timestamp.', 401);

  const skew = Math.abs(Math.floor(Date.now() / 1000) - sent);
  if (skew > MAX_SKEW_SECONDS) {
    return refuse('X-Timestamp is outside the accepted window.', 401);
  }

  const raw = await req.text();
  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');

  // Constant-time, and length-checked first: timingSafeEqual throws on a
  // length mismatch rather than returning false.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return refuse('Signature does not match.', 401);
  }

  return { ok: true, raw };
}

/** The signing side, for tests and for documenting the contract by example. */
export function signPayload(secret: string, timestamp: string, rawBody: string): string {
  return (
    'sha256=' + crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  );
}
