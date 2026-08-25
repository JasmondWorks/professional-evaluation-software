// Shared PayPal REST access. SERVER ONLY — it holds the client secret.
//
// PayPal is this product's payment processor, so anything bought here goes
// through it: the subscription plans, and the maintenance model add-on that the
// sectors without it request from the pricing page.

export const PAYPAL_BASE =
  process.env.PAYPAL_SANDBOX === 'true'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

export async function paypalAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error('PayPal credentials are not configured.');

  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error('Could not authenticate with PayPal.');
  return json.access_token;
}

/** What the maintenance model add-on costs, in whole currency units.
 *
 *  Held here rather than taken from the request: the old Paystack route read the
 *  amount out of the request body, so anyone could have bought the add-on for a
 *  penny by editing the payload. */
export const MAINTENANCE_PRICE = {
  currency: process.env.MAINTENANCE_CURRENCY ?? 'USD',
  value: process.env.MAINTENANCE_PRICE ?? '50.00',
} as const;
