"use client";

import { useDispatch } from "react-redux";
import { setNotificationView } from "@/app/state/setnotification/setNotificationSlice";
import { Warning2, ArrowRight, SearchNormal1 } from "iconsax-react";
import Dept from "@/app/components/assessment/Dept";
import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  staffCount?: number;
  deptCount?: number;
  submittedCount?: number;
  pesuser_nameCount?: number;
  organizationCount?: number;
  [key: string]: any;
};

const isLoading = true;

export default function Assesment() {
  const dispatch = useDispatch();
  const [data, setData] = useState(false);
  const [loading, setLoading] = useState(isLoading);
  const [assessmentData, setAssessmentData] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("/api/getStats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
      })
      .catch((error) => {
        // handle error if needed
        console.error("Error fetching stats:", error);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("/api/getDataEntry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAssessmentData(data);
        setData(true);
        setLoading(false);
        console.log("data", data);
      })
      .catch((error) => console.log("noooo"));
  }, []);
  const filteredData =
    assessmentData?.filter((item) => {
      const matchesSearch = item.dept
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (filterStatus === "ready") {
        matchesFilter = item.total_unique_users >= 15;
      } else if (filterStatus === "needs_data") {
        matchesFilter = item.total_unique_users < 15;
      }

      return matchesSearch && matchesFilter;
    }) || [];

  return (
    <main className="m-6 h-full">
      <div className="assessment bg-white flex justify-between p-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold my-auto">Assessment</h1>
        <h1 className="text-pes my-auto">View Past Appraisal Results</h1>
      </div>

      <div className={`flex flex-col bg-white min-h-full mb-2`}>
        {data ? (
          <>
            <div className="bg-white flex justify-between max-md:gap-2 max-sm:flex-col p-4 mb-2 border-b border-gray-100">
              <div className="bg-[#9E740011] border text-[#9E7400] border-[#9E7400] flex justify-center rounded-lg p-4 w-3/5 max-sm:w-full">
                <Warning2 />
                <p className="text-gray-500 w-11/12 ms-3">
                  {`
                              Data received from ${stats?.submittedCount ?? 0} of ${stats?.staffCount ?? 0} staff across ${
                                assessmentData?.length === 1
                                  ? `the ${assessmentData[0].dept.toLowerCase().endsWith("department") ? assessmentData[0].dept : `${assessmentData[0].dept} department`}`
                                  : `${assessmentData?.length || 0} departments`
                              }.
                              You can assess a department once its data integrity check passes, or assess all employees at once.
                           `}
                </p>
              </div>

              <div className="flex flex-col justify-center max-sm:self-end">
                <Link
                  role="button"
                  href="/assessment/staff"
                  className="flex text-white h-fit w-fit bg-pes border border-pes rounded-md py-3 px-8"
                >
                  Assess All Employees
                  <ArrowRight />
                </Link>
              </div>
            </div>

            <div className="flex gap-4 px-4 mx-4 mb-2">
              <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-md px-3 py-2">
                <SearchNormal1 size="20" className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  className="w-full outline-none text-sm text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="ready">Ready for Assessment (≥15)</option>
                <option value="needs_data">Needs More Data (&lt;15)</option>
              </select>
            </div>

            {filteredData.length > 0 ? (
              filteredData.map((i, key) => <Dept key={key} data={i} />)
            ) : (
              <div className="text-center text-gray-500 py-10 text-sm font-light">
                No departments match your filters.
              </div>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className="flex flex-col w-3/5 m-auto">
                <div className="flex justify-center w-[180px] py-10 my-2 mx-auto">
                  <img
                    src={`/loading.svg`}
                    className="animate-spin"
                    width={40}
                  />
                </div>

                <p className="mx-auto text-center text-sm text-gray-500 font-light">
                  Loading assessment data, please wait...
                </p>
              </div>
            ) : (
              <div className="flex flex-col w-3/5 m-auto">
                <p className="mx-auto text-center text-sm text-gray-500 font-light">
                  No data available for assessment at the moment. You can
                  kickstart the assessment process by notifying your employees
                  to input their data. Set a deadline to ensure everyone
                  contributes to the assessment.
                </p>
                <button
                  className="bg-pes py-3 my-4 px-20 rounded-md text-white new mx-auto outline-none bg-transparent focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-pes"
                  onClick={() => dispatch(setNotificationView())}
                >
                  Send Notifications
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
