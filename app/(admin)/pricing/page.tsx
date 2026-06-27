"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import Subscriptionbutton from "../../components/subscription/paypal";
import PaystackButton from "@/app/components/subscription/paystackButton";
import PayPalProviderWrapper from "../../components/subscription/paypalWrapper";
import { packages } from "../../lib/utils/packages";
import { jwtDecode } from "jwt-decode";import { getAccessToken } from '@/app/utils/auth';


export default function Home() {
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [maintenance, setMaintenance] = useState(false)

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      setEmail(decoded?.email);
      setMaintenance(decoded?.maintenance_model);
    } catch (err) {
      console.error("Invalid token:", err);
    }

    const fetchSubscription = async () => {
      try {
        const res = await fetch(`/api/subscriptions/active?email=${email}`);
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
      await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPlan, newPlan }),
      });
      console.log("Upgrade ready for new payment.");
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  // --- CANCEL PLAN HANDLER ---
  const handleCancelPlan = async () => {
    if (!confirm("Are you sure you want to cancel all plans? This will delete your account and all related data.")) return;

    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("All plans canceled and account deleted.");
        localStorage.removeItem("access_token");
        window.location.href = "/"; // Redirect to home or signup page
      } else {
        alert(data.error || "Failed to cancel plans.");
      }
    } catch (err) {
      console.error("Cancel plan failed:", err);
      alert("Cancel plan failed. Check console for details.");
    }
  };

  const renderPlan = (
    planKey: "basic" | "standard" | "premium",
    color?: string
  ) => {
    const plan = packages[planKey];
    const isActive = activePlan === planKey;
    const canUpgrade =
      activePlan &&
      activePlan !== planKey &&
      ["basic", "standard", "premium"].indexOf(planKey) >
        ["basic", "standard", "premium"].indexOf(activePlan);

    const disabledStyle = isActive ? "opacity-60 pointer-events-none" : "";
    const label = isActive ? "Current Plan" : canUpgrade ? "Upgrade" : "Subscribe";

    return (
      <div
        className={`price-card ${
          color ? color : "bg-white"
        } ${color ? "text-white" : ""} h-112 w-72 border rounded-3xl flex flex-col justify-between p-4 ${disabledStyle} ${
          canUpgrade ? "border-blue-400 shadow-lg" : ""
        }`}
      >
        <div className="flex flex-col">
          {isActive ? (
            <div className="bg-blue-100 text-pes rounded-full py-1 px-2 text-center mb-2 font-light text-sm">
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
          <Suspense
            fallback={
              <button className="border-pes bg-white rounded-lg p-4">
                Loading...
              </button>
            }
          >
            <Subscriptionbutton
              plan={planKey}
            />
          </Suspense>

          <PaystackButton
            email={email}
            planCode={
              planKey === "basic"
                ? "PLN_w4hf2tk7k3mu66a"
                : planKey === "standard"
                ? "PLN_pl6nmfsedqvm0oa"
                : "PLN_bquiv8u3t2otwuh"
            }
            label={label}
          />
          <a href={`/prices?plan=${planKey}`} className={`hover:underline ${color ? "text-white" : "text-pes"}`}>view plan</a>
        </div>
      </div>
    );
  };

  return (
    <PayPalProviderWrapper>
      <main className="w-full flex flex-col">
        {/* Header */}
        <div className="px-12 pt-8 pb-4 ms-6 mt-6 me-6 border-b border-gray-100 bg-white">
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

        {/* Other Packages */}
        {
          (!maintenance)?
          <div className="flex flex-col px-12 p-12 ms-6 mb-6 me-6 bg-white">
            <h1 className="text-xl my-3 font-bold">Other Available Packages</h1>
            <div className="border border-gray-100 rounded-lg px-6 pb-6 flex flex-col">
              <div className="mainte flex justify-between py-4 mb-2 border-b border-gray-100">
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
                intervals for your equipment(s) to optimize efficiency and reduce
                wastage.
              </p>
            </div>
          </div>
          : <></>
        }

      </main>
    </PayPalProviderWrapper>
  );
}
