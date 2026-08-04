"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from '@/app/utils/apiFetch';

export default function SubscriptionSuccess() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (!reference) return;

    async function verifySubscription() {
      const res = await apiFetch(`/api/paystack/verify?ref=${reference}`);
      const data = await res.json();

      if (data.status === "success") {
        setStatus("Subscription Successful 🎉");
      } else {
        setStatus("Subscription Failed ❌");
      }
    }

    verifySubscription();
  }, [reference]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold text-strong">{status}</h1>
      <p className="text-body mt-4">Reference: {reference}</p>
    </div>
  );
}
