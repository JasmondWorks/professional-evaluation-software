"use client";

import { People, Award, Timer, ArrowRight, Add } from "iconsax-react";
import jwt from "jsonwebtoken";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Goalchunk from "@/app/components/goals/goalChunk";
import Performance from "@/app/components/performance/performanceChunk";
import ProfileChunk from "@/app/components/Profilechunk";
import Quickstats from "./Quickstats";
import Datachunk from "@/app/components/data/Datachunk";
import { getAccessToken } from "@/app/utils/auth";

export default function Dashboard() {
  const [performanceView, setPerformanceView] = useState("employee");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const access_token = getAccessToken() as string;
    if (!access_token || access_token === undefined) {
      console.log("No valid token found, redirecting...");
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
      <div className="w-full h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col bg-gray-50">
      {user?.role == "admin" ? (
        <Quickstats />
      ) : (
        <div className="flex flex-col m-8 p-8 bg-white">
          <ProfileChunk />
        </div>
      )}

      <div className="(Goals and Insights)-- flex justify-between max-md:flex-col max-md:gap-2 mx-6 mb-6">
        <div className="(left_panel)-- w-4_5 max-md:w-full flex flex-col">
          <div className="w-full shadow-md shadow-gray-100 p-4 bg-white">
            <div className="flex justify-between w-full p-4">
              <p className="text-3xl text-black my-auto">Goals</p>

              {user?.role == "admin" ? (
                <Link
                  href={"/goals"}
                  className="text-md font-light my-auto text-pes flex"
                >
                  Set new Goal
                  <Add className="mx-2 font-thin" />
                </Link>
              ) : (
                <></>
              )}
            </div>

            <div className="text-white flex justify-between w-full py-4">
              <div className="bg-orng flex flex-col justify-between p-4 rounded-md text-center w-4_5">
                <p className="font-light">Active Goals Set</p>
                <p className="text-4xl font-semibold">{`00`}</p>
              </div>

              <div className="bg-grn flex flex-col justify-between p-4 rounded-md text-center w-4_5">
                <p className="font-light">Goals Completed</p>
                <p className="text-4xl font-semibold">{`00`}</p>
              </div>
            </div>

            <p className="text-xl text-black my-auto p-4">
              Active Goal Metrics
            </p>
            <Goalchunk />
            <div className="viewgoals flex justify-end my-4">
              <Link
                href={`/goals`}
                className="bg-pes rounded-md py-2 px-4 text-white flex"
              >
                View Goals <ArrowRight className="ms-2 text-sm" />{" "}
              </Link>
            </div>
          </div>
        </div>

        {user?.role == "admin" ? (
          <div className="(right_panel)-- w-1/2 max-md:w-full">
            <div className="w-full shadow-md shadow-gray-100 p-4 bg-white">
              <div className="flex justify-start w-full">
                <p className="text-3xl text-black my-auto p-4">
                  Performance Insights
                </p>
              </div>

              <div className="flex flex-col justify-center relative mx-4 my-2">
                <div className="flex justify-start w-3/12">
                  <p
                    className={`me-4  py-4 cursor-pointer ${performanceView == "employee" ? "text-pes" : ""}`}
                    onClick={() => {
                      setPerformanceView("employee");
                    }}
                  >
                    Employees
                  </p>
                  <p
                    className={`me-4  py-4 cursor-pointer ${performanceView == "team" ? "text-pes" : ""}`}
                    onClick={() => {
                      setPerformanceView("team");
                    }}
                  >
                    Teams
                  </p>
                </div>

                <div
                  className={`line w-20 bg-pes h-1 absolute bottom-0 ${performanceView == "employee" ? "left-0" : "left-20"} transition-all rounded-full`}
                ></div>
                <div className="line w-full bg-slate-100 h-1"></div>
              </div>

              <Performance />
            </div>
          </div>
        ) : (
          <div className="(right_panel-alt)-- w-1/2 max-md:w-full">
            <div className="w-full shadow-md shadow-gray-100 p-4 bg-white">
              <div className="flex justify-start w-full">
                <p className="text-3xl text-black my-auto p-4">Data entry</p>
              </div>

              <Datachunk />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
