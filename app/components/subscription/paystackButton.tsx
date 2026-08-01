"use client";
import { useState } from "react";
import { apiFetch } from '@/app/utils/apiFetch';

interface PaystackButtonProps {
  email: string;
  planCode: string;
  label?: string;
}

export default function PaystackButton({ email, planCode, label }: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);

  const subscribeWithPaystack = async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/api/paystack/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, planCode }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        // Redirect in the same tab. window.open(..., "_blank") after an await
        // loses the user-gesture context and gets silently popup-blocked.
        window.location.href = data.authorization_url;
        return;
      }

      alert(data.error || "Subscription initialization failed");
    } catch (err) {
      console.error(err);
      alert("Payment start failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={subscribeWithPaystack}
      disabled={loading}
      className={`w-full mt-3 bg-black hover:bg-green-700 text-white py-2 px-4 rounded-lg ${
        loading ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Redirecting..." : label || "Pay with Paystack"}
    </button>
  );
}
