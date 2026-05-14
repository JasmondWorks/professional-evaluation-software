"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "iconsax-react";import { getAccessToken } from '@/app/utils/auth';


export default function SubscriptionPage() {
  const searchParams = useSearchParams();

  const [type, setType] = useState("company");
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const planFromQuery = searchParams.get("plan")?.toUpperCase();

  // 🔹 All plan configurations by organization type
  const planConfigs: Record<string, any[]> = {
    "public": [
      {
        name: "BASIC",
        features: [
          "Personnel Utilization Index",
          "Productivity Index",
          "Required Organization Staff (Operational Level)",
          "Prediction of Organization Staff (Methods 1 & 2)",
          "Management Staff Level",
          "Stress Model (Basic)",
        ],
      },
      {
        name: "STANDARD",
        features: [
          "Personnel Utilization Index",
          "Productivity Index",
          "Required Organization Staff (Operational Level)",
          "Prediction of Organization Staff (Methods 1 & 2)",
          "Management Staff Level",
          "Stress Model (Basic)",
          "Prediction of Staff (Methods 1, 2 & 3)",
          "Staff Stress Factor Index",
          "Stress Time-Pressure & Conflict Index",
          "Stress Feeling Frequencies Value",
          "Organization Staff Appraisal",
          "Unit Head Overloading",
        ],
      },
      {
        name: "PREMIUM",
        features: [
          "Personnel Utilization Index",
          "Productivity Index",
          "Required Organization Staff (Operational Level)",
          "Prediction of Organization Staff (Methods 1 & 2)",
          "Management Staff Level",
          "Stress Model (Basic)",
          "Prediction of Staff (Methods 1, 2 & 3)",
          "Staff Stress Factor Index",
          "Stress Time-Pressure & Conflict Index",
          "Stress Feeling Frequencies Value",
          "Organization Staff Appraisal",
          "Unit Head Overloading",
          "Boss Valuable Lost Man-hour (Underloading)",
          "Organization Structure Sizing",
          "Organization Redundancy & Real % Redundancy",
          "Achievement Criteria (Academic & Non-Academic)",
          "Staff Motivation",
          "Maintenance Model (On Demand)",
        ],
      },
    ],

    "company": [
    {
      name: "BASIC",
      features: [
        "Determination of the required Organization staff for operational level",
        "Determination of the Number of management staff level",
        "Determination of Organization’s Staff STRESS factor index",
        "Determination of Stress Feeling Frequencies value",
        "Determination of Organization’s Staff Appraisal",
        "Maintenance model: On demand"
      ]
    },
    {
      name: "STANDARD",
      features: [
        "Determination of the required Organization staff for operational level",
        "Determination of the Number of management staff level",
        "Determination of Organization’s Staff STRESS factor index",
        "Determination of Stress Feeling Frequencies value",
        "Determination of Organization’s Staff Appraisal",
        "Maintenance model: On demand",
        "Determination of Boss valuable lost man-hour due to work under loading",
        "Determination of the size of an organization structure",
        "Determining Unit Head Overloading",
        "Achievement criteria performance measurement for Non-Academic Staff",
        "Staff motivation"
      ]
    },
    {
      name: "PREMIUM",
      features: [
        "Determination of the required Organization staff for operational level",
        "Determination of the Number of management staff level",
        "Determination of Organization’s Staff STRESS factor index",
        "Determination of Stress Feeling Frequencies value",
        "Determination of Organization’s Staff Appraisal",
        "Maintenance model: On demand",
        "Determination of Boss valuable lost man-hour due to work under loading",
        "Determination of the size of an organization structure",
        "Determining Unit Head Overloading",
        "Achievement criteria performance measurement for Non-Academic Staff",
        "Staff motivation",
        "Determination of personnel utilization index",
        "Determination of productivity index",
        "Prediction of Organization staff Number required: By method 1, 2 & 3",
        "Determination of Organization’s Staff STRESS all round model",
        "Determination of Organization’s Staff STRESS, Time-Pressure index",
        "Determination of Organization’s Staff STRESS, Conflict index",
        "Determination of Organization’s Redundancy",
        "Determination of Real Percentage redundancy",
        "Achievement criteria performance measurement for Academic Staff"
      ]
    }
    ],

    "academic": [
      {
        name: "BASIC",
        features: [
          "Determination of Student-Teacher Ratio (K*) Method II",
          "Determination of Academic Staff STRESS factor index",
          "Determination of Non-Academic Staff STRESS factor index",
          "Determination of Non-Academic Staff STRESS, Conflict index",
          "Determination of Academic Staff Appraisal",
          "Determination of Non-Academic Staff Appraisal",
          "Staff motivation",
          "Maintenance model: On demand"
        ]
      },
      {
        name: "STANDARD",
        features: [
          "Determination of Student-Teacher Ratio (K*) Method II",
          "Determination of Academic Staff STRESS factor index",
          "Determination of Non-Academic Staff STRESS factor index",
          "Determination of Non-Academic Staff STRESS, Conflict index",
          "Determination of Academic Staff Appraisal",
          "Determination of Non-Academic Staff Appraisal",
          "Staff motivation",
          "Maintenance model: On demand",
          "Determination of Non-Academic Staff STRESS, Time-Pressure index",
          "Determination of Boss valuable lost man-hour due to work under loading",
          "Determination of the size of an organization structure: Two methods available",
          "Achievement criteria performance measurement for Non-Academic Staff"
        ]
      },
      {
        name: "PREMIUM",
        features: [
          "Determination of Student-Teacher Ratio (K*) Method II",
          "Determination of Academic Staff STRESS factor index",
          "Determination of Non-Academic Staff STRESS factor index",
          "Determination of Non-Academic Staff STRESS, Conflict index",
          "Determination of Academic Staff Appraisal",
          "Determination of Non-Academic Staff Appraisal",
          "Staff motivation",
          "Maintenance model: On demand",
          "Determination of Non-Academic Staff STRESS, Time-Pressure index",
          "Determination of Boss valuable lost man-hour due to work under loading",
          "Determination of the size of an organization structure: Two methods available",
          "Achievement criteria performance measurement for Non-Academic Staff",
          "Determination of personnel utilization index",
          "Determination of productivity index",
          "Determination of Student-Teacher Ratio (K*) Method I",
          "Determination of the required Institutions Non-academic staff operational level",
          "Prediction Model for Academic staff Number required",
          "Prediction Model for Non-Academic staff Number required: By method I & II",
          "Determination of the Numbers of Academic staff",
          "Determination of the Number of management staff level",
          "Determination of Academic Staff STRESS all round model",
          "Determination of Academic Staff STRESS, Time-Pressure index",
          "Determination of Academic Staff STRESS, Conflict index",
          "Determination of Stress Feeling Frequencies value",
          "Determining Unit Head Overloading",
          "Determination of Institution’s Redundancy",
          "Determination of Real Percentage redundancy",
          "Achievement criteria performance measurement for Academic Staff"
        ]
      }
    ]
  };

  // 🔹 decode token
  const decodeToken = (token: string) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded) return;

    const category = decoded.productCategory;
    const currentPlan = decoded.productPlan;
    console.log("Decoded Token:", category, currentPlan);

    setType(category);
    setActivePlan(currentPlan);

  }, []);

  // ✅ derive plan safely
  const selectedPlan =
    planConfigs[type]?.find((p) => p.name === planFromQuery) || null;

  const isActive = activePlan === planFromQuery;

  if (!selectedPlan) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Plan not found.
      </div>
    );
  }

  console.log(selectedPlan)

  return (
    <div className="bg-gray-50 py-16 px-6 flex justify-center">
      <div
        className={`max-w-md w-full border rounded-2xl p-6 shadow-lg ${
          isActive ? "border-green-500" : "border-gray-200"
        }`}
      >
        <Link href="/pricing" className="text-gray-600 hover:underline">
          <ArrowLeft/>
        </Link>
        <h1 className="text-2xl font-bold text-center mb-2 text-pes">
          {planFromQuery}
        </h1>

        <p className="text-center text-gray-500 mb-4 capitalize">
          {type.replace(/-/g, " ")}
        </p>

        {/* 🔥 Active indicator */}
        {isActive && (
          <p className="text-center text-green-600 font-semibold mb-4">
            Current Plan
          </p>
        )}

        <ul className="space-y-2 mb-6 text-md text-gray-700">
          {(selectedPlan?.features || []).map((f: string, i: number) => (
            <li key={i} className="flex items-start">
              <span className="text-green-600 font-bold mr-2">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}