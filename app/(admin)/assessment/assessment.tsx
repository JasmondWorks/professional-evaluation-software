"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { ArrowRight, Search, Users } from "lucide-react";
import { setNotificationView } from "@/app/state/setnotification/setNotificationSlice";
import Dept from "@/app/components/assessment/Dept";
import { getAccessToken } from "@/app/utils/auth";
import { apiFetch } from "@/app/utils/apiFetch";
import {
  Alert,
  Button,
  Empty,
  PageHeader,
  Skeleton,
  inputBase,
} from "@/app/components/ui";

// A department needs this many staff submissions before its data can be assessed.
const MIN_SUBMISSIONS = 15;

type Stats = {
  staffCount?: number;
  deptCount?: number;
  submittedCount?: number;
  pesuser_nameCount?: number;
  organizationCount?: number;
  [key: string]: any;
};

export default function Assesment() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    apiFetch("/api/getStats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then(setStats)
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/api/getDataEntry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => setAssessmentData(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Error fetching data entry:", error))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(
    () =>
      assessmentData.filter((item) => {
        const matchesSearch = String(item.dept ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        if (filterStatus === "ready")
          return matchesSearch && item.total_unique_users >= MIN_SUBMISSIONS;
        if (filterStatus === "needs_data")
          return matchesSearch && item.total_unique_users < MIN_SUBMISSIONS;
        return matchesSearch;
      }),
    [assessmentData, searchQuery, filterStatus],
  );

  const deptSummary =
    assessmentData.length === 1
      ? `the ${
          String(assessmentData[0].dept).toLowerCase().endsWith("department")
            ? assessmentData[0].dept
            : `${assessmentData[0].dept} department`
        }`
      : `${assessmentData.length} departments`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Assessment"
        subtitle="Check each department's submitted data, then assess it."
        actions={
          <Button href="/completed-appraisals" variant="secondary">
            Past appraisal results
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : assessmentData.length === 0 ? (
        (stats?.staffCount ?? 0) === 0 ? (
          <Empty
            icon={<Users size={22} />}
            title="Nobody to assess yet"
            description="Your organization has only its administrator, who assesses rather than being assessed. Add employees, then their submitted data will appear here."
            action={<Button href="/em-database/add-employee">Add an employee</Button>}
          />
        ) : (
          <Empty
            icon={<Users size={22} />}
            title="No data submitted yet"
            description="Assessment starts once staff submit their data. Notify your employees and set a deadline so everyone contributes."
            action={
              <Button onClick={() => dispatch(setNotificationView())}>
                Send notifications
              </Button>
            }
          />
        )
      ) : (
        <>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <Alert tone="warning" className="flex-1">
              Data received from{" "}
              <strong className="tabular-nums">{stats?.submittedCount ?? 0}</strong>{" "}
              of <strong className="tabular-nums">{stats?.staffCount ?? 0}</strong>{" "}
              staff across {deptSummary}. A department can be assessed once its
              data integrity check passes — or assess every employee at once.
            </Alert>

            <Button href="/evaluation" className="shrink-0">
              Assess all employees
              <ArrowRight size={18} />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="search"
                aria-label="Search departments"
                placeholder="Search departments"
                className={`${inputBase} pl-9`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter departments by readiness"
              className={`${inputBase} sm:w-64 cursor-pointer`}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All departments</option>
              <option value="ready">
                Ready for assessment (≥{MIN_SUBMISSIONS})
              </option>
              <option value="needs_data">
                Needs more data (&lt;{MIN_SUBMISSIONS})
              </option>
            </select>
          </div>

          {filteredData.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredData.map((i, key) => (
                <Dept key={key} data={i} />
              ))}
            </div>
          ) : (
            <Empty
              icon={<Search size={22} />}
              title="No departments match"
              description="Try a different search term, or clear the readiness filter."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </>
      )}
    </main>
  );
}
