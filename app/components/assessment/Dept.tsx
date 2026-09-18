"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch } from "@/app/utils/apiFetch";
import { Alert, Badge, Button, Card } from "@/app/components/ui";

// A department needs this many scored staff before an integrity test is meaningful.
const MIN_SUBMISSIONS = 15;

type DeptProps = {
  data: {
    dept: string;
    total_unique_users: number;
    total?: number;
    submitted?: number;
  };
};

export default function Dept({ data }: DeptProps) {
  const [status, setStatus] = useState<
    null | "passed" | "outliers" | "notEnough"
  >(null);
  const [outliers, setOutliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deptLabel = data.dept.toLowerCase().endsWith("department")
    ? data.dept
    : `${data.dept} department`;
  const submitted = data.submitted ?? data.total_unique_users;
  const total = data.total ?? data.total_unique_users;

  async function runTest() {
    setLoading(true);
    setStatus(null);
    setOutliers([]);
    setError(null);

    try {
      const dept = encodeURIComponent(data.dept);
      // Pull actual appraisal + performance scores for the department. (The old
      // getDataEntryByDept endpoint required auth and returned only names, so it
      // always produced "not enough data".)
      const [appraisals, performances] = await Promise.all([
        apiFetch(`/api/getAppraisalByDept?dept=${dept}`)
          .then((r) => r.json())
          .catch(() => []),
        apiFetch(`/api/getPerformanceByDept?dept=${dept}`)
          .then((r) => r.json())
          .catch(() => []),
      ]);

      const appraisalList: any[] = Array.isArray(appraisals) ? appraisals : [];
      const performanceList: any[] = Array.isArray(performances)
        ? performances
        : [];

      // Sum each user's available scores across both sources (union of users).
      const userScores: { [user: string]: number } = {};
      const addScores = (name: string, vals: unknown[]) => {
        if (!name) return;
        const nums = vals.filter(
          (v): v is number => typeof v === "number" && !isNaN(v),
        );
        if (nums.length === 0) return;
        userScores[name] =
          (userScores[name] ?? 0) + nums.reduce((s, x) => s + x, 0);
      };

      appraisalList.forEach((a) =>
        addScores(a.pesuser_name, [
          a.teaching_quality,
          a.community_quality,
          a.administrative_quality,
          a.research_quality,
        ]),
      );
      performanceList.forEach((p) =>
        addScores(p.pesuser_name, [
          p.competence,
          p.compatibility,
          p.integrity,
          p.use_of_resources,
        ]),
      );

      const scores = Object.values(userScores);
      if (scores.length < MIN_SUBMISSIONS) {
        setStatus("notEnough");
        return;
      }

      const sorted = [...scores].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length / 4)];
      const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;

      const foundOutliers = Object.entries(userScores)
        .filter(([, score]) => score < lower || score > upper)
        .map(([user]) => user);

      if (foundOutliers.length > 0) {
        setStatus("outliers");
        setOutliers(foundOutliers);
      } else {
        setStatus("passed");
      }
    } catch (err) {
      console.error("Error running test:", err);
      setError(
        "The integrity test could not be run. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const ready = submitted >= MIN_SUBMISSIONS;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-strong capitalize">
              {deptLabel}
            </h3>
            <Badge tone={ready ? "success" : "warning"} dot>
              {ready ? "Ready to test" : `Needs ${MIN_SUBMISSIONS}+ submissions`}
            </Badge>
          </div>
          <p className="text-sm text-muted mt-1 tabular-nums">
            {submitted} of {total} staff submitted
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={runTest}
          loading={loading}
          disabled={loading}
        >
          Run data integrity test
        </Button>
      </div>

      {error && (
        <Alert tone="danger" className="mt-4">
          {error}
        </Alert>
      )}

      {status === "passed" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-success-100 bg-success-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-success-700">
            <CheckCircle2 size={16} />
            Data integrity passed — no outliers detected.
          </p>
          <Button href={`/evaluation?dept=${encodeURIComponent(data.dept)}`} size="sm">
            Assess employees
          </Button>
        </div>
      )}

      {status === "notEnough" && (
        <Alert
          tone="warning"
          icon={<AlertTriangle size={16} />}
          className="mt-4"
        >
          Not enough scored submissions yet — at least {MIN_SUBMISSIONS} are
          required before this department can be assessed.
        </Alert>
      )}

      {status === "outliers" && (
        <Alert
          tone="danger"
          icon={<XCircle size={16} />}
          title={`${outliers.length} outlier${outliers.length === 1 ? "" : "s"} found`}
          className="mt-4"
        >
          <p>Review these submissions before assessing the department:</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {outliers.map((u, i) => (
              <li
                key={i}
                className="rounded-full bg-danger-100 px-2.5 py-0.5 text-xs font-medium"
              >
                {u}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </Card>
  );
}
