"use client";

import { People, Award, Timer } from "iconsax-react";
import React, { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import Skeleton from '@/app/components/ui/Skeleton';

export default function Quickstats({
  openEvaluations,
}: {
  // Goals still open for data entry (computed on the dashboard from the goals list).
  openEvaluations?: number;
} = {}) {
  const [quickStats, setQuickStats] = useState<number[] | null[]>([
    null,
    null,
    null,
  ]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const access_token = getAccessToken() as string;
    const temp_user = jwt.decode(access_token);

    async function getStatData() {
      try {
        const req = await apiFetch("/api/getStatData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
          },
        });

        const res = await req.json();
        setQuickStats(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    getStatData();
  }, []);

  return (
    <div className="(Stats)-- flex flex-wrap gap-2 justify-between m-6">
      <div className="stat_1 shadow-custom shadow-gray-100 flex justify-between text-white rounded-md h-40 p-8 w-3_4 min-w-[220px] max-sm:w-full bg-pes">
        <div className="flex flex-col justify-center">
          <p className="m-1 text-sm">Number of Employees:</p>
          <p className="m-1 text-4xl font-bold">
            {!isLoadingStats ? (
              <>{quickStats[0]?.toString()}</>
            ) : (
              <Skeleton className="h-10 w-16 bg-white/30" />
            )}
          </p>
          <Link href="/em-database" className="m-1 text-xs underline cursor-pointer">
            View All
          </Link>
        </div>
        <People size={64} className="text-gray-400 font-bold mb-auto" />
      </div>

      <div className="stat_2 shadow-custom shadow-gray-100 flex justify-between rounded-md h-40 p-8 w-3_4 min-w-[220px] max-sm:w-full bg-white">
        <div className="flex flex-col justify-center">
          <p className="m-1 text-sm">Completed Appraisals:</p>
          <p className="m-1 text-4xl font-bold text-black">
            {!isLoadingStats ? (
              <>{quickStats[1]?.toString()}</>
            ) : (
              <Skeleton className="h-10 w-16" />
            )}
          </p>
          <Link
            href="/completed-appraisals"
            className="m-1 text-xs underline text-pes cursor-pointer"
          >
            View All
          </Link>
        </div>
        <Award size={64} className="text-gray-100 font-bold mb-auto" />
      </div>

      <div className="stat_3 shadow-custom shadow-gray-100 flex justify-between rounded-md h-40 p-8 w-3_4 min-w-[220px] bg-white  max-sm:w-full">
        <div className="flex flex-col justify-center">
          <p className="m-1 text-sm">Pending Appraisals:</p>
          <p className="m-1 text-4xl font-bold text-black">
            {!isLoadingStats ? (
              <>{quickStats[2]?.toString()}</>
            ) : (
              <Skeleton className="h-10 w-16" />
            )}
          </p>
          <Link
            href="/assessment"
            className="m-1 text-xs underline text-pes cursor-pointer"
          >
            View All
          </Link>
        </div>
        <Timer size={64} className="text-gray-100 font-bold mb-auto" />
      </div>

      <div className="stat_4 shadow-custom shadow-gray-100 flex justify-between rounded-md h-40 p-8 w-3_4 min-w-[220px] bg-white max-sm:w-full">
        <div className="flex flex-col justify-center">
          <p className="m-1 text-sm">Pending Assessments:</p>
          <p className="m-1 text-4xl font-bold text-black">
            {openEvaluations ?? 0}
          </p>
          <Link
            href="/goals"
            className="m-1 text-xs underline text-pes cursor-pointer"
          >
            View All
          </Link>
        </div>
        <Timer size={64} className="text-gray-100 font-bold mb-auto" />
      </div>
    </div>
  );
}
