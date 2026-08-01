"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import Link from "next/link";import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';


function grader(num: number) {
  if (num >= 80) return "1st class (Excellent)";
  else if (num >= 70) return "2nd class (Good)";
  else if (num >= 50) return "3rd class (Fair)";
  else return "4th class (Poor)";
}

function gradeColor(num: number) {
  if (num >= 80) return "text-blue-500"; // Excellent
  if (num >= 70) return "text-green-500"; // Good
  if (num >= 50) return "text-orange-400"; // Fair
  return "text-red-500"; // Poor
}

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getAccessToken();
        const decoded: any = jwt.decode(token as string);

        // Fetch performance + appraisal
        const perfRes = await apiFetch("/api/performance-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pesuser_name: decoded.name, org: decoded.org }),
        });

        const perfResult = await perfRes.json();

        // Fetch achievements from all sources
        const achieveRes = await apiFetch("/api/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: decoded.name }),
        });
        const achieveResult = await achieveRes.json();

        setData(perfResult);
        setAchievements(achieveResult);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p className="p-8 text-gray-600">Loading...</p>;
  if (!data?.performance && !data?.appraisal)
    return <p className="p-8 text-red-600">No data found.</p>;

  const perf = data.performance || {};
  const appr = data.appraisal || {};

  return (
    <div className="flex flex-col m-8 bg-white">
      <div className="nav flex justify-between bg-white h-[4rem] w-full text-md border border-slate-50">
        <h1 className="text-2xl m-3 font-bold">Performance Review</h1>
      </div>

      <div className="bg-gray-50 h-[3rem] flex justify-between">
        <h1 className="my-auto mx-6 font-semibold">Last Assessment Result</h1>
      </div>

      {/* Appraisal Section */}
      <div className="bg-white p-4">
        <div className="flex flex-col">
          <p className="font-semibold my-3 text-lg">Appraisal</p>
          {[
            ["Research Quality", appr.research_quality_evaluation],
            ["Teaching Quality", appr.teaching_quality_evaluation],
            ["Administrative Quality", appr.administrative_quality_evaluation],
            ["Community Quality", appr.community_quality_evaluation],
          ].map(([label, value]) => {
            const color = gradeColor(Number(value));
            return (
              <div
                key={label}
                className="flex justify-between py-3 border-b ms-6 border-[#cfcfcf1a]"
              >
                <p className="w-6/12">{label}</p>
                <p className={`w-3/12 ${color}`}>{Number(value)?.toFixed(2)}%</p>
                <p className={`w-3/12 ${color}`}>{grader(Number(value))}</p>
              </div>
            );
          })}
        </div>

        {/* Performance Section */}
        <div className="flex flex-col">
          <p className="font-semibold my-3 text-lg">Performance</p>
          {[
            ["Competence", perf.competence],
            ["Integrity", perf.integrity],
            ["Compatibility", perf.compatibility],
            ["Use of resources", perf.use_of_resources],
          ].map(([label, value]) => {
            const color = gradeColor(Number(value));
            return (
              <div
                key={label}
                className="flex justify-between py-3 border-b ms-6 border-[#cfcfcf1a]"
              >
                <p className="w-6/12">{label}</p>
                <p className={`w-3/12 ${color}`}>{Number(value)?.toFixed(2)}%</p>
                <p className={`w-3/12 ${color}`}>{grader(Number(value))}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 h-[3rem] flex justify-between">
        <h1 className="my-auto mx-6 font-semibold">Achievements</h1>
      </div>

      <div className="bg-white p-4 min-h-[10rem]">
        {achievements.length === 0 ? (
          <p className="text-gray-500">No achievements found.</p>
        ) : (
          <ul className="space-y-3">
            {achievements.map((item, idx) => (
              <Link href={``} key={idx} className="border p-3 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <p className="font-semibold text-gray-800">{item.achievement || item.title}</p>
                  <p className="text-sm text-gray-400">{item.year || item.date_achieved}</p>
                </div>
                <p className="text-gray-600">{item.description}</p>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
