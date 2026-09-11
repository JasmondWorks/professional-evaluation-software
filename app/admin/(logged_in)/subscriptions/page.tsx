"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";

type SubRow = {
  id: string;
  status: string;
  start_time: string | null;
  next_billing_time: string | null;
  failed_payment_count: number | null;
  created_at: string;
  pesuser: { name: string; email: string; org: string | null };
  plans: { name: string; price_cents: number; currency_code: string };
};

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "text-emerald-600";
    case "CANCELLED":
    case "SUSPENDED":
      return "text-red-600";
    default:
      return "text-muted";
  }
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/subscriptions-overview")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load subscriptions");
        }
        return res.json();
      })
      .then(setSubs)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!subs) return <div className="p-6">Loading subscriptions…</div>;

  return (
    <div className="flex flex-col w-full bg-canvas">
      <div className="p-4">
        <h1 className="text-pes text-3xl">Subscriptions</h1>
        <p className="text-muted text-sm mt-1">{subs.length} most recent, across all organizations</p>
      </div>
      <hr />

      <div className="p-6 overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-sm text-sm">
          <thead>
            <tr className="text-left text-muted border-b">
              <th className="p-4">User</th>
              <th className="p-4">Org</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Status</th>
              <th className="p-4">Next billing</th>
              <th className="p-4">Failed payments</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-4">
                  <div className="font-medium">{s.pesuser.name}</div>
                  <div className="text-muted text-xs">{s.pesuser.email}</div>
                </td>
                <td className="p-4 text-muted">{s.pesuser.org ?? "—"}</td>
                <td className="p-4 text-muted">
                  {s.plans.name} ({(s.plans.price_cents / 100).toFixed(2)} {s.plans.currency_code})
                </td>
                <td className={`p-4 font-medium ${statusColor(s.status)}`}>{s.status}</td>
                <td className="p-4 text-muted">
                  {s.next_billing_time ? new Date(s.next_billing_time).toLocaleDateString() : "—"}
                </td>
                <td className="p-4 text-muted">{s.failed_payment_count ?? 0}</td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted italic">
                  No subscriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
