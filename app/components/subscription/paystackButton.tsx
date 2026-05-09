"use client";
import { useState } from "react";

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

      const response = await fetch("/api/paystack/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, planCode }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        window.open(data.authorization_url, "_blank");
      } else {
        alert("Subscription initialization failed");
      }

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
