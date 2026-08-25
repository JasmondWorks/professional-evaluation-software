// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma.dev';
import { MAINTENANCE_PRICE, PAYPAL_BASE, paypalAccessToken } from '@/app/lib/billing/paypal';

/** Capture the PayPal order for the maintenance add-on, then switch the model on
 *  for the buyer's organization and re-issue their token so the new entitlement
 *  is visible without signing out.
 *
 *  The organization comes from the verified token, never from the request body:
 *  otherwise one org's payment could be pointed at another's account. */
export async function POST(req: Request) {
  try {
    const header = req.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return NextResponse.json({ message: 'Sign in to continue.' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ message: 'Your session has expired. Sign in again.' }, { status: 401 });
    }

    const org = String(decoded?.org ?? '').trim();
    const { orderId } = await req.json();
    if (!orderId || !org) {
      return NextResponse.json({ message: 'Missing the order or the organization.' }, { status: 400 });
    }

    const accessToken = await paypalAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await res.json();

    if (!res.ok || data?.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', data);
      return NextResponse.json({ message: 'The payment did not complete.' }, { status: 400 });
    }

    // The capture is the only thing that says what was actually paid, so check
    // it against the price rather than trusting that the order was ours.
    const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
    const paid = Number(capture?.amount?.value ?? 0);
    const currency = capture?.amount?.currency_code;
    if (
      currency !== MAINTENANCE_PRICE.currency ||
      paid < Number(MAINTENANCE_PRICE.value)
    ) {
      console.warn('maintenance capture underpaid', { paid, currency, orderId });
      return NextResponse.json({ message: 'The amount paid does not match the price.' }, { status: 400 });
    }

    const affected = Number(await prisma.$executeRaw`
      UPDATE "org"
      SET "maintenance_model" = true
      WHERE LOWER("name") = LOWER(${org})
    `);

    if (affected === 0) {
      console.warn('No org matched for maintenance activation', { org, orderId });
      return NextResponse.json({ message: 'Organization not found.' }, { status: 404 });
    }

    const { iat, exp, ...safeUser } = decoded;
    const newToken = jwt.sign({ ...safeUser, maintenance_model: true }, process.env.JWT_SECRET as string);

    return NextResponse.json({
      message: 'Payment received. The maintenance model is now active.',
      org,
      access_token: newToken,
    });
  } catch (err: any) {
    console.error('maintenance verify error:', err);
    return NextResponse.json({ message: 'Could not confirm the payment.' }, { status: 500 });
  }
}
