"use client";

import { notify } from "@/lib/toast";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import Subscriptionbutton from "../../components/subscription/paypal";
import PaystackButton from "@/app/components/subscription/paystackButton";
import PayPalProviderWrapper from "../../components/subscription/paypalWrapper";
import { packages } from "../../lib/utils/packages";
import { jwtDecode } from "jwt-decode";
import { getAccessToken, removeAccessToken } from "@/app/utils/auth";
import { apiFetch } from '@/app/utils/apiFetch';

// Sectors whose product already includes the maintenance model.
const MAINTENANCE_BY_DEFAULT = ["company"];

export default function Home() {
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      setEmail(decoded?.email);
      setMaintenance(decoded?.maintenance_model);
      setCategory(decoded?.productCategory ?? decoded?.category ?? null);
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
    const label = isActive
      ? "Current Plan"
      : canUpgrade
        ? "Upgrade"
        : "Subscribe";

    return (
      <div
        className={`price-card ${
          color ? color : "bg-white"
        } ${color ? "text-white" : ""} h-[28rem] w-72 border rounded-3xl flex flex-col justify-between p-4 ${
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
            <h1 className="text-lg font-bold capitalize">{planKey}</h1>
            <h1 className="text-5xl">
              {plan ? `$${(plan.price / 100).toFixed(0)}` : "-"}
              <span className="text-gray-300 text-xs font-bold">/year</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col mt-4 gap-2">
          <div className={`flex flex-col gap-2 ${payDisabled}`}>
            <Suspense
              fallback={
                <button className="border-pes bg-white rounded-lg p-4">
                  Loading...
                </button>
              }
            >
              <Subscriptionbutton plan={planKey} />
            </Suspense>

            <PaystackButton
              email={email}
              planCode={
                planKey === "basic"
                  ? "PLN_eowlq7d4cp4r0dp"
                  : planKey === "standard"
                    ? "PLN_cle5ip7jtxfpj5k"
                    : "PLN_paglu0ly0z641mm"
              }
              label={label}
            />
          </div>
          <Link
            href={`/prices?plan=${planKey}`}
            className={`hover:underline ${color ? "text-white" : "text-pes"}`}
          >
            view plan
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
        <div className="px-8 py-8 mx-6 bg-white flex justify-center flex-wrap gap-14">
          {renderPlan("basic")}
          {renderPlan("standard")}
          {renderPlan("premium", "bg-my")}
        </div>

        {/* Other Packages.
            The maintenance model comes with the company product, so those
            organizations have it already and are not asked to request it. Every
            other sector — an institution of learning, a public or civil body —
            asks for it here. */}
        {!maintenance && !MAINTENANCE_BY_DEFAULT.includes((category ?? "").toLowerCase()) ? (
          <div className="flex flex-col px-12 p-12 ms-6 mb-6 me-6 bg-white">
            <h1 className="text-xl my-3 font-bold">Other Available Packages</h1>
            <div className="border border-line rounded-lg px-6 pb-6 flex flex-col">
              <div className="mainte flex justify-between py-4 mb-2 border-b border-line">
                <h1 className="font-bold my-auto">Maintenance model</h1>
                <Link
                  href={"/maintenance-payment"}
                  className="text-pes text-sm border border-pes rounded-md px-6 py-2 my-auto"
                >
                  Request
                </Link>
              </div>
              <p className="text-sm">
                This maintenance model helps by providing predictive maintenance
                intervals for your equipment(s) to optimize efficiency and
                reduce wastage. It is included with the company product; request
                it here to add it to your plan.
              </p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </main>
    </PayPalProviderWrapper>
  );
}
