"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "iconsax-react";import { getAccessToken } from '@/app/utils/auth';


export default function SubscriptionPage() {
  const searchParams = useSearchParams();

  const [type, setType] = useState("company");
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [hasMaintenance, setHasMaintenance] = useState(false);

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

    setType(category);
    setActivePlan(currentPlan);
    setHasMaintenance(decoded.maintenance_model === true);

  }, []);

  // ✅ derive plan safely
  const selectedPlan =
    planConfigs[type]?.find((p) => p.name === planFromQuery) || null;

  const isActive = activePlan === planFromQuery;

  if (!selectedPlan) {
    return (
      <div className="text-center mt-20 text-muted">
        Plan not found.
      </div>
    );
  }

  // Gated on the org's actual entitlement, not on product category: category
  // was previously used as a proxy for "already included", but that doesn't
  // hold for every org in that category, and one that genuinely lacked it had
  // no way to buy it. An org that already has it keeps it as a plain checklist
  // line; everyone else gets it pulled out into its own add-on block below.
  const isMaintenanceFeature = (f: string) => /maintenance model/i.test(f);
  const checklistFeatures = hasMaintenance
    ? selectedPlan.features
    : selectedPlan.features.filter((f: string) => !isMaintenanceFeature(f));
  const offersMaintenance = !hasMaintenance && selectedPlan.features.some(isMaintenanceFeature);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6 flex justify-center items-start">
      <div
        className={`max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden transition-all duration-300 ${
          isActive ? "border-2 border-green-500" : "border border-line"
        }`}
      >
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-gradient-to-br from-pes-50 to-blue-100 opacity-50 blur-3xl -z-10 pointer-events-none"></div>

        <Link href="/pricing" className="inline-flex items-center text-muted hover:text-body transition-colors mb-6 group">
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="ml-2 font-medium">Back to Pricing</span>
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-3 text-strong tracking-tight">
            {planFromQuery} Plan
          </h1>
          <p className="text-muted font-medium uppercase tracking-wider text-sm">
            {type.replace(/-/g, " ")} Package
          </p>
        </div>

        {/* 🔥 Active indicator */}
        {isActive && (
          <div className="flex justify-center mb-8">
            <span className="bg-green-100 text-green-700 py-1.5 px-4 rounded-full text-sm font-semibold tracking-wide shadow-sm flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Current Plan
            </span>
          </div>
        )}

        <div className="bg-canvas rounded-2xl p-6 sm:p-8 border border-line">
          <h3 className="text-lg font-semibold text-strong mb-6 flex items-center">
            Plan Features
          </h3>
          <ul className="space-y-4 text-body">
            {checklistFeatures.map((f: string, i: number) => (
              <li key={i} className="flex items-start break-words">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <span className="ml-3 font-medium text-body leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {offersMaintenance && (
          <div className="mt-6 rounded-2xl border border-pes-100 bg-pes-50 p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="shrink-0 grid h-11 w-11 place-items-center rounded-xl bg-white text-pes shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437 5.492 5.492" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-pes-700">Add-on · One-off purchase</p>
                <h4 className="mt-1 text-base font-semibold text-strong">Maintenance model</h4>
                <p className="mt-1 text-sm leading-relaxed text-body">
                  Predictive maintenance intervals for your equipment, to cut wastage and keep
                  utilisation up. Added to your plan as soon as payment clears.
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              {hasMaintenance ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-4 py-2 text-sm font-medium text-success-700">
                  Already on your plan
                </span>
              ) : (
                <Link
                  href="/maintenance-payment"
                  className="inline-flex items-center rounded-lg bg-pes px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pes-800"
                >
                  Purchase now
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}