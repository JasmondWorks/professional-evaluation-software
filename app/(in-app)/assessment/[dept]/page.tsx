'use client';

// One department's submitted scores, with the same data-integrity check the
// assessment list runs — here with the per-employee detail behind it.

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch } from "@/app/utils/apiFetch";
import { BackLink,
  Alert,
  Badge,
  Card,
  Empty,
  PageHeader,
  Skeleton,
} from "@/app/components/ui";

// Minimum scored values before the outlier test is meaningful.
const MIN_SCORES = 15;

type AppraisalEntry = {
  pesuser_name: string;
  dept: string;
  teaching_quality: number;
  community_quality: number;
  administrative_quality: number;
  research_quality: number;
};

type PerformanceEntry = {
  pesuser_name: string;
  dept: string;
  competence: number;
  compatibility: number;
  integrity: number;
  use_of_resources: number;
};

type CombinedEntry = {
  pesuser_name: string;
  dept: string;
  scores: number[];
};

type Analysis =
  | { status: "success"; message: string }
  | { status: "error"; message: string }
  | { status: "outliers"; message: string; outliers: CombinedEntry[] };

export default function Page({ params }: { params: { dept: string } }) {
  const [data, setData] = useState<CombinedEntry[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dept = decodeURIComponent(params.dept);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiFetch(`/api/getAppraisalByDept?dept=${encodeURIComponent(dept)}`).then((res) =>
        res.json(),
      ),
      apiFetch(`/api/getPerformanceByDept?dept=${encodeURIComponent(dept)}`).then(
        (res) => res.json(),
      ),
    ])
      .then(([appraisals, performances]) => {
        if (cancelled) return;
        const appraisalList: AppraisalEntry[] = Array.isArray(appraisals) ? appraisals : [];
        const performanceList: PerformanceEntry[] = Array.isArray(performances)
          ? performances
          : [];

        // Union of everyone who has appraisal OR performance data (not just
        // appraisal-driven) so performance-only staff are still analysed.
        const byName = new Map<
          string,
          { pesuser_name: string; dept: string; a?: AppraisalEntry; p?: PerformanceEntry }
        >();
        for (const a of appraisalList) {
          byName.set(a.pesuser_name, { pesuser_name: a.pesuser_name, dept: a.dept, a });
        }
        for (const p of performanceList) {
          const existing = byName.get(p.pesuser_name);
          if (existing) existing.p = p;
          else byName.set(p.pesuser_name, { pesuser_name: p.pesuser_name, dept: p.dept, p });
        }

        const combined: CombinedEntry[] = Array.from(byName.values()).map(
          ({ pesuser_name, dept, a, p }) => {
            const scores = [
              a?.teaching_quality,
              a?.community_quality,
              a?.administrative_quality,
              a?.research_quality,
              p?.competence,
              p?.compatibility,
              p?.integrity,
              p?.use_of_resources,
            ].filter((s): s is number => typeof s === "number");

            return { pesuser_name, dept, scores };
          },
        );

        setData(combined);
        runAnalysis(combined);
      })
      .catch((err) => {
        console.error("Error fetching dept data:", err);
        if (!cancelled)
          setLoadError(
            "This department's submissions could not be loaded. Check your connection and try again.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dept]);

  function runAnalysis(entries: CombinedEntry[]) {
    const allScores = entries.flatMap((e) => e.scores);

    if (allScores.length < MIN_SCORES) {
      setAnalysis({
        status: "error",
        message: `Not enough data — ${allScores.length} of the ${MIN_SCORES} scores required.`,
      });
      return;
    }

    // Data integrity: no NaN/null
    const invalid = allScores.filter((s) => s == null || isNaN(s));
    if (invalid.length > 0) {
      setAnalysis({
        status: "error",
        message: `${invalid.length} invalid score${invalid.length === 1 ? "" : "s"} found — the submissions need correcting before assessment.`,
      });
      return;
    }

    // Outlier detection (Z-score method)
    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const stdDev = Math.sqrt(
      allScores.reduce((a, b) => a + (b - mean) ** 2, 0) / allScores.length,
    );

    const outliers = entries.filter((e) =>
      e.scores.some((score) => Math.abs((score - mean) / stdDev) > 2),
    );

    if (outliers.length > 0) {
      setAnalysis({
        status: "outliers",
        message: `${outliers.length} submission${outliers.length === 1 ? "" : "s"} sit more than 2 standard deviations from the mean.`,
        outliers,
      });
    } else {
      setAnalysis({
        status: "success",
        message: "Data integrity passed — every score is within range.",
      });
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <BackLink href="/assessment" className="mb-3">Back to assessment</BackLink>

      <PageHeader
        title={dept}
        subtitle="Submitted appraisal and performance scores for this department."
      />

      {loadError && (
        <Alert tone="danger" title="Submissions unavailable" className="mb-6">
          {loadError}
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {analysis && (
            <Alert
              tone={
                analysis.status === "success"
                  ? "success"
                  : analysis.status === "outliers"
                    ? "danger"
                    : "warning"
              }
              icon={
                analysis.status === "success" ? (
                  <CheckCircle2 size={16} />
                ) : analysis.status === "outliers" ? (
                  <XCircle size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )
              }
              title={analysis.message}
              className="mb-6"
            >
              {analysis.status === "outliers" && (
                <ul className="mt-1 flex flex-col gap-1">
                  {analysis.outliers.map((o, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium">{o.pesuser_name}</span> —{" "}
                      <span className="tabular-nums">{o.scores.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          {data.length === 0 ? (
            <Empty
              title="No submissions in this department"
              description="Scores appear here once staff in this department submit their appraisal or performance data."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {data.map((item, index) => (
                <Card key={index} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-strong">
                        {item.pesuser_name}
                      </p>
                      <p className="text-xs text-muted capitalize">{item.dept}</p>
                    </div>
                    <Badge tone="neutral">
                      {item.scores.length} score{item.scores.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.scores.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-canvas border border-line px-2 py-0.5 text-xs text-body tabular-nums"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
