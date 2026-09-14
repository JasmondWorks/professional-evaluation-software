#!/usr/bin/env node
/** Sign a request against /api/storefront/{provision,availability} for local
 *  testing. Prints ready-to-paste curl headers.
 *
 *  Usage:
 *    node scripts/sign-storefront-request.mjs provision '{"organization_name":"..."}'
 *    node scripts/sign-storefront-request.mjs availability '?organization_name=X&admin_email=Y@z.com'
 */
import crypto from 'crypto';

const [, , kind, payload] = process.argv;
const secret = process.env.PROVISION_HMAC_SECRET;

if (!secret) {
  console.error('Set PROVISION_HMAC_SECRET in your shell (same value as .env.local).');
  process.exit(1);
}
if (!kind || !payload) {
  console.error('Usage: node scripts/sign-storefront-request.mjs <provision|availability> <body-or-query>');
  process.exit(1);
}

const timestamp = Math.floor(Date.now() / 1000).toString();
const signedContent = kind === 'availability' ? payload : payload; // body or "?a=b&c=d" — sign as given
const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(`${timestamp}.${signedContent}`).digest('hex');

console.log(`X-Timestamp: ${timestamp}`);
console.log(`X-Signature: ${signature}`);
