"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/utils/apiFetch";
import LoadingButton from "../../../components/ui/LoadingButton";

type Overview = {
  orgCount: number;
  userCount: number;
  activeSubCount: number;
  usersByRole: { role: string; count: number }[];
  subsByStatus: { status: string; count: number }[];
  plans: { id: string; name: string; price_cents: number; currency_code: string }[];
  recentOrgs: { id: number; name: string; category: string; plan: string; ongoing: boolean; created_at: string | null }[];
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-1">
      <p className="text-muted text-sm">{label}</p>
      <p className="text-3xl font-semibold text-pes">{value}</p>
    </div>
  );
}

export default function PlatformOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function logout() {
    localStorage.removeItem("access_token");
    router.push("/admin");
  }

  useEffect(() => {
    apiFetch("/api/admin/overview")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load platform overview");
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!data) {
    return <div className="p-6">Loading platform overview…</div>;
  }

  return (
    <div className="flex flex-col w-full bg-canvas">
      <div className="flex w-full justify-between items-center p-4">
        <h1 className="text-pes text-3xl">Platform Overview</h1>
        <LoadingButton onClick={logout} className="hover:text-pes active:text-pes text-muted text-lg">
          Logout
        </LoadingButton>
      </div>
      <hr />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        <StatCard label="Organizations" value={data.orgCount} />
        <StatCard label="Users" value={data.userCount} />
        <StatCard label="Active subscriptions" value={data.activeSubCount} />
        <StatCard label="Active plans" value={data.plans.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-3">Users by role</h2>
          <div className="flex flex-col gap-2">
            {data.usersByRole
              .sort((a, b) => b.count - a.count)
              .map((r) => (
                <div key={r.role} className="flex justify-between text-sm">
                  <span className="text-muted capitalize">{r.role}</span>
                  <span className="font-medium">{r.count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-3">Subscriptions by status</h2>
          <div className="flex flex-col gap-2">
            {data.subsByStatus.length === 0 && (
              <p className="text-muted text-sm italic">No subscriptions yet.</p>
            )}
            {data.subsByStatus.map((s) => (
              <div key={s.status} className="flex justify-between text-sm">
                <span className="text-muted capitalize">{s.status.toLowerCase()}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-3">Recently created organizations</h2>
          {data.recentOrgs.length === 0 ? (
            <p className="text-muted text-sm italic">No organizations yet.</p>
          ) : (
            <div className="flex flex-col divide-y">
              {data.recentOrgs.map((org) => (
                <div key={org.id} className="flex justify-between py-2 text-sm">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-muted">{org.category}</span>
                  <span className="text-muted">{org.plan}</span>
                  <span className={org.ongoing ? "text-emerald-600" : "text-muted"}>
                    {org.ongoing ? "Ongoing" : "Idle"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
