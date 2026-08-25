'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { notify } from '@/lib/toast';
import { getAccessToken, setAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { Alert, Card, CardBody } from '@/app/components/ui';
import PayPalOrderProvider from '@/app/components/subscription/paypalOrderWrapper';

// Buying the maintenance model add-on.
//
// This ran on Paystack, which was the odd one out — the rest of the product is
// bought through PayPal — and it asked the buyer to type their own organization
// and email into a form, then sent the amount from the browser. All three are
// gone: the organization comes from the signed-in token, the price comes from the
// server, and the payment is a PayPal order.

function MaintenancePayment() {
  const [org, setOrg] = useState('');
  const [price, setPrice] = useState<{ currency: string; value: string } | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const claims = JSON.parse(atob(token.split('.')[1]));
      setOrg(claims?.org ?? '');
    } catch {
      /* the page still works without the name; the server knows it */
    }
  }, []);

  /** Ask the server to open a PayPal order and hand back its id. */
  async function createOrder() {
    setError('');
    const res = await apiFetch('/api/maintenance/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? 'Could not start the payment.');
    setPrice(data.price ?? null);
    return data.orderId as string;
  }

  /** Capture it, switch the model on, and take the new token so the sidebar and
   *  the models list pick the entitlement up without a fresh sign-in. */
  async function onApprove(orderId: string) {
    const res = await apiFetch('/api/maintenance/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? 'Could not confirm the payment.');

    if (data.access_token) setAccessToken(data.access_token);
    setDone(true);
    notify.success('The maintenance model is now active.');
    setTimeout(() => {
      window.location.href = '/maintenance';
    }, 1500);
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <Link
        href="/pricing"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-pes"
      >
        <ArrowLeft size={18} />
        Back to pricing
      </Link>

      <Card>
        <CardBody className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-strong">Maintenance model</h1>
          <p className="mt-2 text-sm text-body">
            Predictive maintenance intervals for your equipment, to cut wastage and keep
            utilisation up. A one-off purchase — it is added to your plan as soon as the
            payment clears.
          </p>

          <dl className="mt-6 flex flex-col gap-2 rounded-lg border border-line bg-canvas p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Organization</dt>
              <dd className="font-medium text-strong">{org || '—'}</dd>
            </div>
            {price ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Price</dt>
                <dd className="font-medium tabular-nums text-strong">
                  {price.currency} {price.value}
                </dd>
              </div>
            ) : null}
          </dl>

          {error ? (
            <Alert tone="danger" className="mt-5">
              {error}
            </Alert>
          ) : null}

          {done ? (
            <Alert tone="success" className="mt-5">
              Payment received. Taking you to the maintenance model…
            </Alert>
          ) : (
            <div className="mt-6">
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={async () => {
                  try {
                    return await createOrder();
                  } catch (err: any) {
                    setError(err?.message ?? 'Could not start the payment.');
                    throw err;
                  }
                }}
                onApprove={async (data) => {
                  try {
                    await onApprove(data.orderID as string);
                  } catch (err: any) {
                    setError(err?.message ?? 'Could not confirm the payment.');
                  }
                }}
                onError={(err) => {
                  console.error('PayPal maintenance error:', err);
                  setError('The payment could not be completed. Try again.');
                }}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </main>
  );
}

export default function MaintenancePaymentPage() {
  return (
    <PayPalOrderProvider>
      <MaintenancePayment />
    </PayPalOrderProvider>
  );
}
