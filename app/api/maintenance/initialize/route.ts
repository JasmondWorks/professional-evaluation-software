// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MAINTENANCE_PRICE, PAYPAL_BASE, paypalAccessToken } from '@/app/lib/billing/paypal';

/** Start the purchase of the maintenance model add-on: create a PayPal order and
 *  hand its id back for the buttons to approve.
 *
 *  This route used to open a Paystack transaction, which was the odd one out —
 *  everything else in the product is bought through PayPal. It also took the
 *  amount straight from the request body, so the price was whatever the browser
 *  said it was; the figure now comes from the server. */
export async function POST(req: Request) {
  try {
    const header = req.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return NextResponse.json({ message: 'Sign in to continue.' }, { status: 401 });

    let claims: any;
    try {
      claims = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ message: 'Your session has expired. Sign in again.' }, { status: 401 });
    }

    const org = String(claims?.org ?? '').trim();
    if (!org) {
      return NextResponse.json(
        { message: 'This account is not attached to an organization.' },
        { status: 403 },
      );
    }

    const accessToken = await paypalAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: 'PES maintenance model',
            // Carried through the capture so the payment can be tied back to an
            // organization even if the buyer's session has changed.
            custom_id: org,
            amount: {
              currency_code: MAINTENANCE_PRICE.currency,
              value: MAINTENANCE_PRICE.value,
            },
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('PayPal order creation failed:', data);
      return NextResponse.json({ message: 'Could not start the payment.' }, { status: 502 });
    }

    return NextResponse.json({ orderId: data.id, price: MAINTENANCE_PRICE });
  } catch (err: any) {
    console.error('maintenance initialize error:', err);
    return NextResponse.json({ message: 'Could not start the payment.' }, { status: 500 });
  }
}
