"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newGoal, viewGoal } from "@/app/state/goals/goalSlice";
import { Status, CalendarRemove } from "iconsax-react";
import jwt from "jsonwebtoken";
import { getAccessToken } from "@/app/utils/auth";
import { notify } from "@/lib/toast";
import { apiFetch } from '@/app/utils/apiFetch';

// Full static class — dynamic `text-${x}-500` doesn't render under Tailwind v4.
function colorGrade(num: any): string {
  return num < 50 ? "text-danger-600" : "text-success-600";
}

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

export default function Goals() {
  const [grid, setGrid] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const dispatch = useDispatch();
  const [user, setUser] = useState({ name: "", role: "", org: "", id: "" });
  const [evaluation, setEvaluation] = useState<EvaluationType[]>([]);
  const [toggling, setToggling] = useState<EvaluationType | null>(null);
  const [clearing, setClearing] = useState(false);
  // Toggles whenever the "new goal" modal opens/closes — used to refetch the
  // list right after a goal is created (no page reload needed).
  const newGoalFlag = useSelector((state: any) => state.goal?.new);

  // Goals overdue by MORE than 2 weeks — eligible to be cleared.
  const overdueGoals = goals.filter((g) => {
    if (!g.due_date) return false;
    const d = new Date(g.due_date).getTime();
    return !isNaN(d) && d < Date.now() - 14 * 24 * 60 * 60 * 1000;
  });

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
      else notify.error(data.error ||"Failed to update");
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
        body: JSON.stringify({ token, goalIds: overdueGoals.map((g: any) => g.id) }),
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
    } catch (e) {
      notify.error(e instanceof Error ? e.message :"Failed to clear overdue goals");
    } finally {
      setClearing(false);
    }
  }

  // Remind the owner (once per visit) to tidy up long-overdue goals.
  const remindedRef = useRef(false);
  useEffect(() => {
    if (!remindedRef.current && overdueGoals.length > 0) {
      remindedRef.current = true;
      notify.info?.(
        `You have ${overdueGoals.length} goal${overdueGoals.length === 1 ? "" : "s"} overdue by more than 2 weeks. Consider clearing them.`,
      );
    }
  }, [overdueGoals.length]);

  return (
    <main className="m-6">
      <div className="goals flex justify-between">
        <h1 className="text-2xl font-bold my-auto">Goals</h1>

        <div className="actions flex items-center">
          {overdueGoals.length > 0 && (
            <button
              onClick={handleClearOverdue}
              disabled={clearing}
              title="Remove goals overdue by more than 2 weeks"
              className="my-auto mr-3 rounded-md border border-danger-100 text-danger-700 px-4 py-2 text-sm font-medium hover:bg-danger-50 disabled:opacity-50"
            >
              {clearing ? "Clearing…" : `Clear overdue (${overdueGoals.length})`}
            </button>
          )}
          <div
            className={`${grid ? "border-pes text-pes" : ""} grid rounded-md border hover:border-pes mx-3 my-auto p-1`}
            onClick={() => setGrid(true)}
          >
            <Image width={25} height={25} src={`/grid.svg`} alt={`grid`} />
          </div>
          <div
            className={`${grid ? "" : "border-pes text-pes"} list border rounded-md mx-3 my-auto p-1 hover:border-pes`}
            onClick={() => setGrid(false)}
          >
            <Image width={25} height={25} src={`/list.svg`} alt={`list`} />
          </div>

          {user?.role == "admin" && (
            <div
              className="bg-pes py-3 px-8 rounded-md text-white new ms-12 cursor-pointer"
              onClick={() => dispatch(newGoal())}
            >
              Set new Goal
            </div>
          )}
        </div>
      </div>

      {/* Admin evaluation toggle controls */}
      {user.role === "admin" && (
        <div className="my-6 bg-white border rounded-md p-6">
          <h2 className="font-semibold text-lg mb-1">
            Data Entry Access Controls
          </h2>
          <p className="text-sm text-muted mb-4">
            Enable or disable each form type for staff. Changes take effect
            immediately.
          </p>
          <div className="flex gap-6 flex-wrap">
            {(Object.keys(EVAL_LABELS) as EvaluationType[]).map((type) => {
              const isEnabled = evaluation.includes(type);
              const isLoading = toggling === type;

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
                <div
                  key={type}
                  className="flex flex-col gap-2 border rounded-md p-4 min-w-[180px]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{EVAL_LABELS[type]}</span>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggle(type, isEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                                ${isEnabled ? "bg-pes" : "bg-gray-300"}
                                                ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                ${isEnabled ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                  <span
                    className={`text-xs font-semibold ${isEnabled ? "text-green-600" : "text-muted"}`}
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  {dueDate && (
                    <span
                      className={`text-xs ${isPastDue ? "text-danger-600" : "text-muted"}`}
                    >
                      Due: {dueDate}
                      {isPastDue ? " (past due)" : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center">
        {loadingGoals ? (
          <div className="flex flex-col my-8">
            <div className="h-12 w-full rounded-md animate-pulse bg-canvas m-1"></div>
            <div className="h-12 w-full rounded-md animate-pulse bg-canvas m-1"></div>
            <div className="h-12 w-full rounded-md animate-pulse bg-canvas m-1"></div>
            <div className="h-12 w-full rounded-md animate-pulse bg-canvas m-1"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-16 text-muted">
            <p className="text-lg">No goals set yet.</p>
            {user.role === "admin" && (
              <p className="text-sm mt-1">
                Click "Set new Goal" to get started.
              </p>
            )}
          </div>
        ) : (
          <div
            className={`${grid ? "grid grid-cols-3 gap-4" : "flex flex-col"} my-8 `}
          >
            {goals?.map((i, key) => {
              return (
                <div
                  key={key}
                  className={`${grid ? "w-72 py-6" : "grid grid-cols-3 gap-4 items-center w-full py-1 text-left"} bg-white rounded-md border border-line px-12 cursor-pointer`}
                  onClick={async () => {
                    dispatch(viewGoal({ payload: i, type: "view" }));
                  }}
                >
                  <h1 className={`${grid ? "text-xl font-bold" : ""} my-2`}>
                    {i.name}
                  </h1>

                  <p className="flex my-auto">
                    <Status />
                    <span
                      className={`mx-2 ${typeof i.status == "number" ? colorGrade(i.status) : "text-warning-600"}`}
                    >
                      {typeof i.status == "number"
                        ? `${i.status}% completed`
                        : i.status}
                    </span>
                  </p>

                  <p className="flex my-auto">
                    <CalendarRemove />
                    <span
                      className={`mx-2 ${(daysLeft(i.due_date) ?? -1) < 3 ? "text-danger-600" : "text-success-600"}`}
                    >
                      {daysLeftLabel(i.due_date)}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
