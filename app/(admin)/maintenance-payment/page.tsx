'use client';

import { notify } from "@/lib/toast";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "iconsax-react";
import {jwtDecode} from "jwt-decode";import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';


export default function MaintenancePaymentPage() {
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const reference = searchParams?.get("reference");

  const hasVerified = useRef(false); // prevent double verification

  // Load from localStorage / token
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedOrg = localStorage.getItem("org");

    if (savedEmail) setEmail(savedEmail);
    if (savedOrg) setOrg(savedOrg);

    if (!savedEmail || !savedOrg) {
      const token = getAccessToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (!savedEmail) setEmail(payload?.email || "");
          if (!savedOrg)
            setOrg(
              payload?.org ||
              payload?.organization ||
              payload?.org_name ||
              payload?.orgName ||
              payload?.company ||
              ""
            );
        } catch {}
      }
    }
  }, []);

  // Auto verify after Paystack redirect
  useEffect(() => {
    if (reference && org && !hasVerified.current) {
      hasVerified.current = true;
      verifyPayment(reference);
    }
  }, [reference, org]);

  async function startPayment() {
    if (!org) return notify.error("Organization required.");
    if (!email) return notify.error("Email required.");

    setLoading(true);
    setMessage("");

    try {
      const res = await apiFetch("/api/maintenance/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, org, amountNaira: 5000 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      window.location.href = data.authorization_url;
    } catch (err: any) {
      setMessage(err?.message || "Payment initialization failed.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment(ref?: string) {
    setLoading(true);
    setMessage("");

    try {
      const token = getAccessToken();

      const res = await apiFetch("/api/maintenance/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference: ref || reference }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      // ✅ IMPORTANT: update token
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      setMessage(`Payment verified. Maintenance activated for ${data?.org || org}.`);

      setTimeout(() => {
        window.location.href = "/maintenance";
      }, 1500);

    } catch (err: any) {
      setMessage(err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">

        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-pes transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          Back to Pricing
        </Link>

        <h1 className="text-2xl font-bold mb-2 text-strong">
          Maintenance Plan
        </h1>

        <p className="text-body mb-6 text-sm">
          Activate the maintenance model for your organization.
        </p>

        {/* Org */}
        <div className="mb-4">
          <label className="text-sm font-medium">Organization</label>
          <input
            value={org}
            onChange={(e) => {
              setOrg(e.target.value);
              localStorage.setItem("org", e.target.value);
            }}
            className="w-full border rounded p-2 mt-1"
            placeholder="Your organization"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              localStorage.setItem("email", e.target.value);
            }}
            className="w-full border rounded p-2 mt-1"
            placeholder="you@example.com"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={startPayment}
            disabled={loading}
            className="flex-1 bg-pes text-white py-2 rounded"
          >
            {loading ? "Processing..." : "Pay with Paystack"}
          </button>

          {reference && (
            <button
              onClick={() => verifyPayment()}
              disabled={loading}
              className="bg-green-600 text-white px-4 rounded"
            >
              Verify
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <p className="mt-4 text-sm text-body">{message}</p>
        )}

      </div>
    </main>
  );
}