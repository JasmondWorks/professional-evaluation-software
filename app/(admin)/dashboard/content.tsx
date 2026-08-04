"use client";

import { Add, ArrowRight } from "iconsax-react";
import jwt from "jsonwebtoken";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Goalchunk from "@/app/components/goals/goalChunk";
import Performance from "@/app/components/performance/performanceChunk";
import ProfileChunk from "@/app/components/Profilechunk";
import Quickstats from "./Quickstats";
import StressCycleBanner from "@/app/components/StressCycleBanner";
import ApprovalBanner from "@/app/components/ApprovalBanner";
import MyStressResultsCard from "@/app/components/MyStressResultsCard";
import { getAccessToken } from "@/app/utils/auth";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";

export default function Dashboard() {
  const [performanceView, setPerformanceView] = useState("employee");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const router = useRouter();

  // A goal is "completed" at 100%; anything below is still active (overdue ones
  // included — they still need doing).
  const isCompleted = (g: any) => Number(g?.status) >= 100;
  const activeGoalsCount = goals.filter((g) => !isCompleted(g)).length;
  const completedGoalsCount = goals.filter(isCompleted).length;

  // "Open Evaluations" = still incomplete AND not past its due date, i.e.
  // evaluations currently open to staff for data entry.
  const isWithinDue = (g: any) => {
    if (!g?.due_date) return false;
    const d = new Date(g.due_date);
    return !isNaN(d.getTime()) && d.getTime() >= Date.now();
  };
  const openEvaluationsCount = goals.filter(
    (g) => !isCompleted(g) && isWithinDue(g),
  ).length;

  useEffect(() => {
    const access_token = getAccessToken() as string;
    if (!access_token || access_token === undefined) {
      router.push("/login");
      return;
    }

    try {
      const temp_user = jwt.decode(access_token);
      if (temp_user && typeof temp_user === "object") {
        setUser({
          name: (temp_user as any).name,
          role: (temp_user as any).role,
        });
      }
    } catch (error) {
      console.error("Token decode failed", error);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="w-full h-[60vh] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-pes border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role == "admin";

  return (
    <main className="w-full flex flex-col">
      <StressCycleBanner />
      <ApprovalBanner />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {isAdmin ? (
          <Quickstats openEvaluations={openEvaluationsCount} />
        ) : (
          <Card>
            <div className="p-6">
              <ProfileChunk />
            </div>
          </Card>
        )}

        {/* Staff see their own dept/faculty stress here when the admin grants access. */}
        {!isAdmin && <MyStressResultsCard />}

        {/* Goals + Insights */}
        <div
          className={`grid gap-6 ${isAdmin ? "lg:grid-cols-2" : "grid-cols-1"}`}
        >
          {/* Goals panel */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="text-lg font-semibold text-strong">Goals</h2>
              {isAdmin && (
                <Button href="/goals" variant="ghost" size="sm">
                  <Add size={18} /> Set new goal
                </Button>
              )}
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-warning-100 bg-warning-50 p-4">
                  <p className="text-sm text-warning-700">Active goals set</p>
                  <p className="mt-1 text-3xl font-semibold text-warning-700 tabular-nums">
                    {activeGoalsCount}
                  </p>
                </div>
                <div className="rounded-lg border border-success-100 bg-success-50 p-4">
                  <p className="text-sm text-success-700">Goals completed</p>
                  <p className="mt-1 text-3xl font-semibold text-success-700 tabular-nums">
                    {completedGoalsCount}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted mb-2">
                  Active goal metrics
                </p>
                <Goalchunk onGoalsLoaded={setGoals} />
              </div>

              <div className="flex justify-end">
                <Button href="/goals" variant="primary" size="sm">
                  View goals <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Performance insights (admin only) */}
          {isAdmin && (
            <Card className="flex flex-col">
              <div className="px-5 py-4 border-b border-line">
                <h2 className="text-lg font-semibold text-strong">
                  Performance insights
                </h2>
              </div>

              <div className="p-5">
                <div
                  role="tablist"
                  aria-label="Performance view"
                  className="inline-flex items-center gap-1 rounded-lg bg-line/50 p-1 mb-4"
                >
                  {(["employee", "team"] as const).map((v) => (
                    <button
                      key={v}
                      role="tab"
                      aria-selected={performanceView === v}
                      onClick={() => setPerformanceView(v)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                        performanceView === v
                          ? "bg-surface text-pes-700 shadow-xs"
                          : "text-muted hover:text-strong"
                      }`}
                    >
                      {v === "employee" ? "Employees" : "Teams"}
                    </button>
                  ))}
                </div>

                <Performance view={performanceView} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
