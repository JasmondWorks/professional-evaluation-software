"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";
import { BackLink } from "@/app/components/ui";
import AwardArt, { type ArtKind } from "@/app/components/motivation/AwardArt";
import { PERIODS, type Period } from "@/app/lib/motivation/scheme";

// What this member of staff has earned, and a way to take it away with them.
//
// The motivation model is an admin surface: it ranks a whole organization, and
// nobody but the admin should read it. The client still wanted staff to be able
// to print their own awards, so this is the one-person view of the same scheme.

type Mine = {
  name: string;
  dept: string | null;
  overall: number | null;
  level: string | null;
  entitlement: {
    actions: string[];
    certificateClass: string | null;
    motivators: string[];
    disciplinary: boolean;
  } | null;
  awards: {
    id: number;
    motivator: string;
    detail: string | null;
    period_label: string;
    level: string;
    awarded_at: string;
  }[];
};

const certArt = (cls: string | null): ArtKind | null =>
  cls === "1st class" ? "cert-1st" : cls === "2nd class" ? "cert-2nd" : cls === "3rd class" ? "cert-3rd" : null;
const badgeArt = (cls: string | null): ArtKind | null =>
  cls === "1st class" ? "badge-1st" : cls === "2nd class" ? "badge-2nd" : cls === "3rd class" ? "badge-3rd" : null;

export default function MyAwardsPage() {
  const [period, setPeriod] = useState<Period>("annual");
  const [mine, setMine] = useState<Mine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await apiFetch(`/api/my-awards?period=${period}`, { method: "GET" });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load your awards.");
        setMine(body);
        setError(null);
      } catch (err: any) {
        setError(err.message ?? "Could not load your awards.");
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  const cls = mine?.entitlement?.certificateClass ?? null;

  return (
    <div className="mx-auto w-full p-8">
      <div className="mb-4">
        <BackLink href="/dashboard">Back to dashboard</BackLink>
      </div>

      <h1 className="text-2xl font-bold text-strong">My awards</h1>
      <p className="mt-1 max-w-2xl text-body">
        What your performance result earns you under the organization's motivation scheme,
        and the awards already recorded against your name.
      </p>

      {loading ? (
        <p className="mt-8 text-muted">Loading your results…</p>
      ) : error ? (
        <p className="mt-8 rounded-lg bg-danger-50 px-4 py-3 text-danger-700">{error}</p>
      ) : mine ? (
        <div className="mt-8 flex flex-col gap-6">
          <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{mine.dept ?? "—"}</p>
                <p className="text-xl font-bold text-strong">{mine.name}</p>
                {mine.level ? (
                  <p className="mt-2 text-body">
                    Overall{" "}
                    <strong>{mine.overall == null ? "—" : mine.overall.toFixed(2)}</strong>, which
                    is <strong>{mine.level}</strong>.
                  </p>
                ) : (
                  <p className="mt-2 text-muted">
                    No settled performance result yet, so nothing has been earned.
                  </p>
                )}
              </div>
              <label className="text-sm font-semibold text-body">
                Period
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="mt-1.5 block rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400"
                >
                  {PERIODS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {mine.entitlement && mine.entitlement.actions.length > 0 && (
            <section
              className={`rounded-xl border p-6 shadow-sm ${
                mine.entitlement.disciplinary
                  ? "border-warning-200 bg-warning-50"
                  : "border-line bg-white"
              }`}
            >
              <h2 className="text-sm font-semibold text-strong">
                {mine.entitlement.disciplinary ? "What follows" : "What you have earned"}
              </h2>
              <ul className="mt-2 list-inside list-disc text-sm text-body">
                {mine.entitlement.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>
          )}

          {cls && (
            <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-strong">
                Your certificate and badge — {cls}
              </h2>
              <p className="mt-1 text-xs text-muted">
                Print either one. It opens in its own window at full size.
              </p>
              <div className="mt-5 flex flex-wrap items-start justify-center gap-8">
                {certArt(cls) && (
                  <AwardArt
                    kind={certArt(cls) as ArtKind}
                    printable
                    size={520}
                    recipient={mine.name}
                    title={`${mine.level} performance${mine.dept ? ` · ${mine.dept}` : ""}`}
                    issuer="PES"
                    date={new Date().toLocaleDateString()}
                  />
                )}
                {badgeArt(cls) && (
                  <AwardArt
                    kind={badgeArt(cls) as ArtKind}
                    printable
                    size={200}
                    title={mine.level ?? undefined}
                    recipient={mine.name}
                  />
                )}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-strong">Awards on record</h2>
            {mine.awards.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Nothing has been formally recorded against your name yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-body">
                {mine.awards.map((a) => (
                  <li key={a.id} className="border-b border-line pb-2 last:border-0">
                    <span className="font-medium text-strong">{a.motivator}</span>
                    {a.detail && <span className="text-muted"> — {a.detail}</span>}
                    <span className="block text-xs text-muted">
                      {a.period_label} · {a.level} ·{" "}
                      {new Date(a.awarded_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
