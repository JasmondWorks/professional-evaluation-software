"use client";  

export default function StripeCheckoutButton({ plan }: { plan: string }) {
  const handleCheckout = async () => {
    // const res = await fetch("/api/subByStripe", {
    //   method: "POST",
    //   body: JSON.stringify({ plan }),
    //   headers: { "Content-Type": "application/json" },
    // });
    // const { url } = await res.json();
    // window.location.href = url;
  };

  return (
    <button
      onClick={handleCheckout}
      className="p-2 bg-white text-pes rounded-xl border border-pes"
    >
      Pay with Stripe
    </button>
  );
}
