import { apiFetch } from '@/app/utils/apiFetch';
"use client";

import Button from '@/app/components/ui/Button';

export default function StripeCheckoutButton({ plan }: { plan: string }) {
  const handleCheckout = async () => {
    // const res = await apiFetch("/api/subByStripe", {
    //   method: "POST",
    //   body: JSON.stringify({ plan }),
    //   headers: { "Content-Type": "application/json" },
    // });
    // const { url } = await res.json();
    // window.location.href = url;
  };

  return (
    <Button
      variant="outline"
      onClick={handleCheckout}
      className="border-pes text-pes bg-white"
    >
      Pay with Stripe
    </Button>
  );
}
