"use client";

import { notify } from "@/lib/toast";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { usePayPalScriptReducer } from "@paypal/react-paypal-js";
import Subscriptionbutton from "../../components/subscription/paypal";
import PayPalProviderWrapper from "../../components/subscription/paypalWrapper";
import { packages } from "../../lib/utils/packages";
import { jwtDecode } from "jwt-decode";
import { getAccessToken, removeAccessToken } from "@/app/utils/auth";
import { apiFetch } from '@/app/utils/apiFetch';
import { Alert } from "@/app/components/ui";
import Skeleton from "@/app/components/ui/Skeleton";
import Button from "@/app/components/ui/Button";

// The PayPal buttons on each card only exist once its SDK script has loaded,
// so rendering the cards immediately meant a moment of cards with a
// half-formed payment section (missing/blank buttons) before it arrived. This
// gates the whole cards area on that one load, so what appears is either a
// complete set of cards or a skeleton — never something in between.
function PaymentCardsGate({ children }: { children: React.ReactNode }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <Alert tone="danger" className="mx-6">
        Payment options could not be loaded. Refresh the page to try again.
      </Alert>
    );
  }

  if (isPending) {
    return (
      <div className="px-8 py-8 mx-6 bg-white flex justify-center flex-wrap gap-14">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="w-72 h-[26rem] rounded-3xl" />
        ))}
      </div>
    );
  }

  return <>{children}</>;
}

export default function Home() {
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let tokenPlan: string | null = null;
    try {
      const decoded: any = jwtDecode(token);
      setEmail(decoded?.email);
      setMaintenance(decoded?.maintenance_model);
      tokenPlan = decoded?.productPlan ? String(decoded.productPlan).toLowerCase() : null;
      // Shown immediately rather than left blank while the subscription
      // fetch below is in flight — an org whose plan was set directly (a
      // seeded org, or one provisioned outside the in-app payment flow)
      // might have no subscriptions_info row to override this with, so this
      // is also the final answer for those, not just a placeholder.
      if (tokenPlan) setActivePlan(tokenPlan);
    } catch (err) {
      console.error("Invalid token:", err);
    }

    const fetchSubscription = async () => {
      try {
        const res = await apiFetch(`/api/subscriptions/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.active) setActivePlan(data.plan?.toLowerCase());
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
      }
    };

    fetchSubscription();
  }, [email]);

  const handleUpgrade = async (oldPlan: string, newPlan: string) => {
    try {
      await apiFetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPlan, newPlan }),
      });
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  // --- CANCEL PLAN HANDLER ---
  const handleCancelPlan = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel all plans? This will delete your account and all related data.",
      )
    )
      return;

    try {
      const res = await apiFetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        notify.success("All plans canceled and account deleted.");
        removeAccessToken();
        try {
          await apiFetch('/api/logout', { method: 'POST' });
        } catch(e) { console.error(e) }
        window.location.href = "/"; // Redirect to home or signup page
      } else {
        notify.error(data.error ||"Failed to cancel plans.");
      }
    } catch (err) {
      console.error("Cancel plan failed:", err);
      notify.error("Cancel plan failed. Check console for details.");
    }
  };

  const renderPlan = (
    planKey: "basic" | "standard" | "premium",
    color?: string,
  ) => {
    const plan = packages[planKey];
    const isActive = activePlan === planKey;
    const canUpgrade =
      activePlan &&
      activePlan !== planKey &&
      ["basic", "standard", "premium"].indexOf(planKey) >
        ["basic", "standard", "premium"].indexOf(activePlan);

    // Only the subscribe/pay actions are disabled for the current plan — the
    // rest of the card (incl. "view plan") must stay interactive.
    const payDisabled = isActive ? "opacity-60 pointer-events-none" : "";

    return (
      <div
        className={`price-card ${
          color ? color : "bg-white"
        } ${color ? "text-white" : ""} w-72 border rounded-3xl flex flex-col p-4 ${
          canUpgrade ? "border-blue-400 shadow-lg" : ""
        }`}
      >
        <div className="flex flex-col">
          {isActive ? (
            <div className="bg-pes-100 text-pes rounded-full py-1 px-2 text-center mb-2 font-light text-sm">
              Current plan
            </div>
          ) : (
            <div className="h-6 mb-2"></div>
          )}

          <div
            className={`des my-2 pb-4 ${
              color ? "border-b border-blue-400" : "border-b border-gray-50"
            }`}
          >
            <h1 className={`text-lg font-bold capitalize ${color ? "text-white" : ""}`}>{planKey}</h1>
            <h1 className={color ? "text-5xl text-white" : "text-5xl"}>
              {plan ? `$${(plan.price / 100).toFixed(0)}` : "-"}
              <span className={`text-xs font-bold ${color ? "text-white/70" : "text-muted"}`}>/year</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col mt-6 gap-2">
          <div className={`isolate flex flex-col gap-2 ${payDisabled}`}>
            <Suspense
              fallback={
                <Button variant="outline" disabled className="border-pes p-4 h-auto">
                  Loading...
                </Button>
              }
            >
              <Subscriptionbutton plan={planKey} />
            </Suspense>
          </div>
          <Link
            href={`/prices?plan=${planKey}`}
            className={`inline-flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium underline underline-offset-2 transition-colors ${
              color ? "text-white/90 hover:text-white" : "text-pes hover:text-pes-800"
            }`}
          >
            View plan details
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <PayPalProviderWrapper>
      <main className="w-full flex flex-col">
        {/* Header */}
        <div className="px-12 pt-8 pb-4 ms-6 mt-6 me-6 border-b border-line bg-white">
          <h1 className="text-2xl my-3 font-bold">Pricing</h1>
          <p className="text-sm">
            Simple pricing. No hidden fees. Advanced features for your company.
          </p>
        </div>

        {/* Cards */}
        <PaymentCardsGate>
          <div className="px-8 py-8 mx-6 bg-white flex justify-center flex-wrap gap-14">
            {renderPlan("basic")}
            {renderPlan("standard")}
            {renderPlan("premium", "bg-my")}
          </div>
        </PaymentCardsGate>

        {/* Other Packages.
            Gated on the actual entitlement (maintenance_model), not on product
            category: category was previously used as a proxy for "the company
            product already includes this", but that assumption doesn't hold for
            every company-category org, and a company org that genuinely lacks
            it had no way to buy it. */}
        {!maintenance ? (
          <div className="flex flex-col px-12 py-8 ms-6 mb-6 me-6 bg-white">
            <h1 className="text-xl mb-4 font-bold">Add-on</h1>
            <div className="rounded-2xl border border-pes-100 bg-pes-50 p-6 sm:p-7 max-w-2xl">
              <div className="flex items-start gap-4">
                <div className="shrink-0 grid h-11 w-11 place-items-center rounded-xl bg-white text-pes shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437 5.492 5.492" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-pes-700">Add-on · One-off purchase</p>
                  <h2 className="mt-1 text-base font-semibold text-strong">Maintenance model</h2>
                  <p className="mt-1 text-sm leading-relaxed text-body">
                    Predictive maintenance intervals for your equipment, to cut wastage and keep
                    utilisation up. Included with the company product; purchase it here to add it
                    to your plan.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href={"/maintenance-payment"}
                  className="inline-flex items-center rounded-lg bg-pes px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pes-800"
                >
                  Purchase now
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </main>
    </PayPalProviderWrapper>
  );
}
