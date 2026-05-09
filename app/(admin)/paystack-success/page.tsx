"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubscriptionSuccess() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (!reference) return;

    async function verifySubscription() {
      const res = await fetch(`/api/paystack/verify?ref=${reference}`);
      const data = await res.json();
      console.log("Verification:", data);

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
      <h1 className="text-2xl font-bold text-gray-800">{status}</h1>
      <p className="text-gray-600 mt-4">Reference: {reference}</p>
    </div>
  );
}
