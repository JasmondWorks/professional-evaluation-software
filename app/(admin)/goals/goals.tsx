"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newGoal, viewGoal } from "@/app/state/goals/goalSlice";
import { CalendarClock, LayoutGrid, List, Target } from "lucide-react";
import jwt from "jsonwebtoken";
import { getAccessToken } from "@/app/utils/auth";
import { notify } from "@/lib/toast";
import { apiFetch } from "@/app/utils/apiFetch";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  PageHeader,
  Skeleton,
  Switch,
} from "@/app/components/ui";

// Whole days between now and a goal's due_date (null when missing/invalid).
function daysLeft(due: any): number | null {
  if (!due) return null;
  const d = new Date(due);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function daysLeftLabel(due: any): string {
  const dl = daysLeft(due);
  if (dl === null) return "No due date";
  if (dl < 0)
    return `Overdue by ${Math.abs(dl)} day${Math.abs(dl) === 1 ? "" : "s"}`;
  if (dl === 0) return "Due today";
  return `${dl} day${dl === 1 ? "" : "s"} left`;
}

// Due-date urgency, as tone rather than as a raw colour.
function dueTone(due: any): "danger" | "warning" | "neutral" {
  const dl = daysLeft(due);
  if (dl === null) return "neutral";
  if (dl < 0) return "danger";
  if (dl < 3) return "warning";
  return "neutral";
}

const DUE_TEXT = {
  danger: "text-danger-700",
  warning: "text-warning-700",
  neutral: "text-muted",
} as const;

type Goal = {
  id?: number;
  name: string;
  status: number | string;
  due_date: string;
  evaluation_type?: string;
};

type EvaluationType = "appraisal" | "performance" | "stress";

const EVAL_LABELS: Record<EvaluationType, string> = {
  appraisal: "Appraisal",
  performance: "Performance",
  stress: "Stress",
};

const EVAL_HINTS: Record<EvaluationType, string> = {
  appraisal: "Staff can submit the appraisal form.",
  performance: "Staff can submit the performance form.",
  stress: "Staff can submit the stress instrument.",
};

export default function Goals() {
  const [grid, setGrid] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const dispatch = useDispatch();
  const [user, setUser] = useState({ name: "", role: "", org: "", id: "" });
  const [evaluation, setEvaluation] = useState<EvaluationType[]>([]);
  const [orgData, setOrgData] = useState<any>(null);
  const [toggling, setToggling] = useState<EvaluationType | null>(null);
  const [clearing, setClearing] = useState(false);
  // Toggles whenever the "new goal" modal opens/closes — used to refetch the
  // list right after a goal is created (no page reload needed).
  const newGoalFlag = useSelector((state: any) => state.goal?.new);

  const isAdmin = user.role === "admin";

  // Goals overdue by MORE than 2 weeks — eligible to be cleared.
  const overdueGoals = useMemo(
    () =>
      goals.filter((g) => {
        if (!g.due_date) return false;
        const d = new Date(g.due_date).getTime();
        return !isNaN(d) && d < Date.now() - 14 * 24 * 60 * 60 * 1000;
      }),
    [goals],
  );

  useEffect(() => {
    const access_token = getAccessToken() as string;
    const tokenData = jwt.decode(access_token) as any;

    if (tokenData && typeof tokenData === "object" && "name" in tokenData) {
      setUser({
        name: tokenData.name ?? "",
        role: tokenData.role ?? "",
        org: tokenData.org ?? "",
        id: tokenData.id ?? "",
      });
    }

    async function fetchGoal() {
      try {
        const data = await apiFetch("/api/getGoals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tokenData),
        });
        const goalData = await data.json().catch(() => []);
        // Always store an array so the render never crashes on a bad shape.
        setGoals(Array.isArray(goalData) ? goalData : []);
      } catch {
        setGoals([]);
      } finally {
        setLoadingGoals(false);
      }
    }

    fetchGoal();
  }, [newGoalFlag]);

  // Fetch current org evaluation state for admin
  useEffect(() => {
    if (!user.org || user.role !== "admin") return;

    apiFetch(`/api/org/${encodeURIComponent(user.org)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.data?.evaluation) setEvaluation(res.data.evaluation);
        if (res?.data) setOrgData(res.data);
      })
      .catch(console.error);
  }, [user.org, user.role]);

  async function handleToggle(type: EvaluationType, currentlyEnabled: boolean) {
    setToggling(type);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/toggleEvaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          evaluation_type: type,
          enabled: !currentlyEnabled,
        }),
      });
      const data = await res.json();
      if (res.ok) setEvaluation(data.evaluation);
      else notify.error(data.error || "Failed to update");
    } catch (err) {
      console.error(err);
      notify.error("Error updating evaluation");
    } finally {
      setToggling(null);
    }
  }

  async function handleClearOverdue() {
    setClearing(true);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/clearOverdueGoals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          goalIds: overdueGoals.map((g: any) => g.id),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to clear");
      // Drop the cleared goals from view immediately.
      setGoals((prev) =>
        prev.filter((g) => {
          if (!g.due_date) return true;
          const d = new Date(g.due_date).getTime();
          return isNaN(d) || d >= Date.now() - 14 * 24 * 60 * 60 * 1000;
        }),
      );
      notify.success(
        `Cleared ${overdueGoals.length} overdue goal${overdueGoals.length === 1 ? "" : "s"}.`,
      );
    } catch (e) {
      notify.error(
        e instanceof Error ? e.message : "Failed to clear overdue goals",
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Goals"
        subtitle="Evaluation targets for this organization, and the deadline each one runs to."
        actions={
          <>
            <div
              role="group"
              aria-label="Goal layout"
              className="flex items-center rounded-lg border border-line bg-surface p-0.5"
            >
              {(
                [
                  { key: false, label: "List view", Icon: List },
                  { key: true, label: "Grid view", Icon: LayoutGrid },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setGrid(key)}
                  aria-label={label}
                  aria-pressed={grid === key}
                  className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:shadow-focus ${
                    grid === key
                      ? "bg-pes-50 text-pes-700"
                      : "text-muted hover:text-strong hover:bg-line/50"
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            {isAdmin && <Button onClick={() => dispatch(newGoal())}>Set new goal</Button>}
          </>
        }
      />

      {overdueGoals.length > 0 && (
        <Alert
          tone="warning"
          title={`${overdueGoals.length} goal${overdueGoals.length === 1 ? " is" : "s are"} more than two weeks overdue`}
          className="mb-6 items-center"
        >
          <div className="flex flex-wrap items-center gap-3">
            <p>Clearing them removes the goals; submitted data is not affected.</p>
            <Button
              variant="secondary"
              size="sm"
              loading={clearing}
              disabled={clearing}
              onClick={handleClearOverdue}
            >
              Clear overdue ({overdueGoals.length})
            </Button>
          </div>
        </Alert>
      )}

      {/* Admin evaluation toggle controls */}
      {isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-sm font-semibold text-strong">
              Data-entry access controls
            </h2>
            <p className="text-sm text-muted mt-1">
              Enable or disable each form type for staff. Changes take effect
              immediately.
            </p>
          </CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line p-px rounded-b-xl overflow-hidden">
            {(Object.keys(EVAL_LABELS) as EvaluationType[]).map((type) => {
              const isEnabled = evaluation.includes(type);

              // Most recently created goal of this type (highest id) —
              // .find() returned the oldest, showing a stale "past due".
              const matching = goals.filter(
                (g: any) =>
                  g.name?.toLowerCase().includes(type) ||
                  g.evaluation_type === type,
              );
              const relatedGoal = matching.length
                ? matching.reduce((latest: any, g: any) =>
                    Number(g.id ?? 0) > Number(latest.id ?? 0) ? g : latest,
                  )
                : undefined;
              const dueDate = relatedGoal?.due_date
                ? new Date(relatedGoal.due_date).toLocaleDateString()
                : null;
              const isPastDue = relatedGoal?.due_date
                ? new Date(relatedGoal.due_date) < new Date()
                : false;

              return (
                <div key={type} className="bg-surface p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-strong">
                        {EVAL_LABELS[type]}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {EVAL_HINTS[type]}
                      </p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      disabled={toggling === type}
                      onCheckedChange={() => handleToggle(type, isEnabled)}
                      aria-label={`${EVAL_LABELS[type]} data entry`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={isEnabled ? "success" : "neutral"} dot>
                      {isEnabled ? "Open to staff" : "Closed"}
                    </Badge>
                    {dueDate && (
                      <span
                        className={`text-xs ${isPastDue ? "text-danger-700" : "text-muted"}`}
                      >
                        Due {dueDate}
                        {isPastDue ? " · past due" : ""}
                      </span>
                    )}
                  </div>

                  {type === 'stress' && (
                    <div className="mt-2 pt-2 border-t border-line text-xs text-muted space-y-1">
                      {orgData?.stressCycle ? (
                        <>
                          <p>
                            <span className="font-medium text-strong">Form 5 Closes:</span>{" "}
                            {orgData.stressCycle.settings_closes_at ? new Date(orgData.stressCycle.settings_closes_at).toLocaleString() : 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium text-strong">Form 6/7 Closes:</span>{" "}
                            {orgData.stressCycle.feeling_closes_at ? new Date(orgData.stressCycle.feeling_closes_at).toLocaleString() : 'N/A'}
                          </p>
                        </>
                      ) : (
                        <p className="italic">No active cycle is currently running.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {loadingGoals ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Empty
          icon={<Target size={22} />}
          title="No goals set yet"
          description={
            isAdmin
              ? "Set a goal to give an evaluation cycle a deadline staff can work towards."
              : "Your administrator has not set any evaluation goals for this organization yet."
          }
          action={
            isAdmin ? (
              <Button onClick={() => dispatch(newGoal())}>Set new goal</Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={
            grid
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-2"
          }
        >
          {goals.map((goal, key) => {
            const tone = dueTone(goal.due_date);
            const status = goal.status;
            const numericStatus = typeof status === "number" ? status : null;

            return (
              <Card
                key={goal.id ?? key}
                as="button"
                interactive
                onClick={() => dispatch(viewGoal({ payload: goal, type: "view" }))}
                className={`text-left w-full focus-visible:outline-none focus-visible:shadow-focus ${
                  grid ? "p-5 flex flex-col gap-4" : "px-5 py-4"
                }`}
              >
                <div
                  className={
                    grid
                      ? "flex flex-col gap-4"
                      : "grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_auto_auto] items-center gap-x-6 gap-y-2"
                  }
                >
                  <h3
                    className={`font-semibold text-strong capitalize ${grid ? "text-lg" : "text-sm"}`}
                  >
                    {goal.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    {numericStatus !== null ? (
                      <>
                        <div className="h-1.5 w-16 rounded-full bg-line overflow-hidden">
                          <div
                            className={`h-full rounded-full ${numericStatus < 50 ? "bg-warning-600" : "bg-success-600"}`}
                            style={{
                              width: `${Math.max(0, Math.min(100, numericStatus))}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-body tabular-nums">
                          {numericStatus}%
                        </span>
                      </>
                    ) : (
                      <Badge tone="warning">{String(status)}</Badge>
                    )}
                  </div>

                  <p
                    className={`flex items-center gap-1.5 text-sm ${DUE_TEXT[tone]}`}
                  >
                    <CalendarClock size={15} />
                    {daysLeftLabel(goal.due_date)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
