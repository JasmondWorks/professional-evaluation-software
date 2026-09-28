'use client';

import { useCallback, useEffect, useState } from 'react';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { notify } from '@/lib/toast';
import { getAccessToken, setAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink, Alert, Card, CardBody } from '@/app/components/ui';
import Skeleton from '@/app/components/ui/Skeleton';
import PayPalOrderProvider from '@/app/components/subscription/paypalOrderWrapper';

// Renders the actual buttons only once the PayPal script has resolved, so a
// slow load shows a skeleton instead of a moment with no button at all.
// Static — see app/components/subscription/paypal.tsx for why this has to be
// a stable reference: the SDK tears down and rebuilds the buttons whenever
// `style` or any callback prop changes identity, and this page's several
// state updates (org, price, error, done) were recreating an inline object
// here on every render, which sometimes left the buttons blank until reload.
const BUTTON_STYLE = { layout: 'vertical' as const };

function PayPalButtonsGate(props: React.ComponentProps<typeof PayPalButtons>) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <Alert tone="danger">Payment options could not be loaded. Refresh the page to try again.</Alert>
    );
  }
  if (isPending) {
    return <Skeleton className="h-11 rounded-md" />;
  }
  return <PayPalButtons {...props} />;
}

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
  const createOrder = useCallback(async () => {
    setError('');
    try {
      const res = await apiFetch('/api/maintenance/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? 'Could not start the payment.');
      setPrice(data.price ?? null);
      return data.orderId as string;
    } catch (err: any) {
      setError(err?.message ?? 'Could not start the payment.');
      throw err;
    }
  }, []);

  /** Capture it, switch the model on, and take the new token so the sidebar and
   *  the models list pick the entitlement up without a fresh sign-in. */
  const onApprove = useCallback(async (data: { orderID?: string | null }) => {
    try {
      const res = await apiFetch('/api/maintenance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Could not confirm the payment.');

      if (json.access_token) setAccessToken(json.access_token);
      setDone(true);
      notify.success('The maintenance model is now active.');
      setTimeout(() => {
        window.location.href = '/maintenance';
      }, 1500);
    } catch (err: any) {
      setError(err?.message ?? 'Could not confirm the payment.');
    }
  }, []);

  const onError = useCallback((err: Record<string, unknown>) => {
    console.error('PayPal maintenance error:', err);
    setError('The payment could not be completed. Try again.');
  }, []);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <BackLink href="/pricing" className="mb-4">Back to pricing</BackLink>

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
          ) : !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
            <Alert tone="warning" className="mt-5">
              Payments are not configured on this server yet — the PayPal client ID is missing.
              Ask whoever manages deployment to set it before this page can take a payment.
            </Alert>
          ) : (
            <div className="isolate mt-6">
              <PayPalButtonsGate
                style={BUTTON_STYLE}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
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
