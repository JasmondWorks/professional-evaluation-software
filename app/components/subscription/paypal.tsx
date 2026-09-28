"use client";

import { memo, useCallback } from "react";
import { notify } from "@/lib/toast";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

// Static — hoisted so it's the same object reference on every render. The
// @paypal/react-paypal-js SDK tears down and rebuilds its button iframe
// whenever `style` or any of the callback props change identity, and an
// inline object/arrow function here is a *new* reference on every render of
// this component. The pricing page re-renders several times in quick
// succession right after mount (email, maintenance flag and active plan each
// land as separate state updates), which was tearing the buttons down
// mid-render and sometimes left them blank until a full page reload.
const BUTTON_STYLE = { layout: "vertical" as const, label: "subscribe" as const };

function SubscriptionButton({ plan }: { plan: string }) {
  const createSubscription = useCallback(
    async () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      type MyJwtPayload = { userID: string; name: string };
      const { userID, name } = jwtDecode<MyJwtPayload>(token);

      const res = await apiFetch("/api/subByPaypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userID, name }),
      });
      const sub = await res.json();
      if (sub.error) {
        throw new Error(sub.error);
      }
      // PayPal JS SDK expects actions.subscription.create from client
      // But instead you can return sub.id so PayPal picks up the subscription
      // If you want, you could also provide a direct JS-SDK create with plan_id
      return sub.paypal.id;
    },
    [plan],
  );

  const onApprove = useCallback(async (data: { subscriptionID?: string | null }) => {
    // subscription approved
    // data.subscriptionID has the subscription id
    // store this with your backend if needed, or finalise UX
    notify.success("Subscription successful", "ID: " + data.subscriptionID);
  }, []);

  const onError = useCallback((err: Record<string, unknown>) => {
    console.error("PayPal subscription error:", err);
    notify.error("Subscription could not be completed.");
  }, []);

  return (
    <PayPalButtons
      style={BUTTON_STYLE}
      createSubscription={createSubscription}
      onApprove={onApprove}
      onError={onError}
    />
  );
}

export default memo(SubscriptionButton);
