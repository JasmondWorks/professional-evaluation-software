"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

/** PayPal for one-off purchases.
 *
 *  The subscription wrapper loads the SDK with `intent: "subscription"` and
 *  vaulting, which cannot create a plain order. The maintenance model is bought
 *  once rather than subscribed to, so it needs the capture intent. */
export default function PayPalOrderProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        intent: "capture",
        currency: process.env.NEXT_PUBLIC_MAINTENANCE_CURRENCY ?? "USD",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
