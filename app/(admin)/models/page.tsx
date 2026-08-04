"use client";

import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import {
  Graph,
  Award,
  Heart,
  Activity,
  Personalcard,
  Hierarchy,
  People,
  Data,
  TextBlock,
  Book1,
  Verify,
  Setting2,
  ArrowRight2,
} from "iconsax-react";
import Link from "next/link";

interface UserToken {
  productCategory: string;
  productPlan: string;
  [key: string]: any;
}

type ProductDetails = {
  productCategory: string;
  productPlan: string;
};

const planConfigs: Record<string, Record<string, string[]>> = {
  public: {
    basic: [
      "Personnel Utilization",
      "Productivity Index",
      "Student Teacher",
      "Staff Number",
      "Stress",
    ],
    standard: [
      "Personnel Utilization",
      "Productivity Index",
      "Student Teacher",
      "Staff number",
      "Stress",
      "Appraisal",
    ],
    premium: [
      "Personnel Utilization",
      "Productivity Index",
      "Student Teacher",
      "Staff number",
      "Stress",
      "Appraisal",
      "Organization Structure",
      "Performance",
      "Motivation",
    ],
  },
  company: {
    basic: ["Staff Number", "Stress", "Appraisal"],
    standard: [
      "Staff Number",
      "Stress",
      "Appraisal",
      "Organization Structure",
      "Performance",
      "Motivation",
    ],
    premium: [
      "Staff Number",
      "Stress",
      "Appraisal",
      "Organization Structure",
      "Performance",
      "Motivation",
      "Personnel Utilization",
      "Productivity Index",
      "Redundancy Index",
    ],
  },
  academic: {
    basic: [
      "Student Teacher",
      "Stress",
      "Appraisal",
      "Non-Academic Appraisal",
      "Motivation",
      "Maintenance model",
    ],
    standard: [
      "Student Teacher",
      "Stress",
      "Appraisal",
      "Non-Academic Appraisal",
      "Motivation",
      "Maintenance model",
      "Organization Structure",
      "Performance",
    ],
    premium: [
      "Student Teacher",
      "Stress",
      "Appraisal",
      "Non-Academic Appraisal",
      "Motivation",
      "Maintenance model",
      "Organization Structure",
      "Performance",
      "Personnel Utilization",
      "Productivity Index",
      "Staff Number",
      "Redundancy Index",
    ],
  },
};

const modelDefinitions: Record<
  string,
  { path: string; description: string; icon: any; color: string }
> = {
  Performance: {
    path: "/models/performance",
    description:
      "Evaluate and track organizational performance metrics and yields.",
    icon: Graph,
    color: "text-blue-500 bg-pes-50",
  },
  Appraisal: {
    path: "/models/appraisal",
    description:
      "Conduct staff academic appraisals and evaluate teaching quality.",
    icon: Award,
    color: "text-warning-600 bg-warning-50",
  },
  Motivation: {
    path: "/models/motivation",
    description: "Analyze and measure employee motivation levels effectively.",
    icon: Heart,
    color: "text-rose-500 bg-rose-50",
  },
  Stress: {
    path: "/models/stress",
    description: "Monitor workplace stress factors and emotional fatigue.",
    icon: Activity,
    color: "text-danger-600 bg-danger-50",
  },
  "Non-Academic Appraisal": {
    path: "/models/non-academic-appraisal",
    description: "Evaluate non-teaching staff performance and efficiency.",
    icon: Personalcard,
    color: "text-orange-500 bg-orange-50",
  },
  "Organization Structure": {
    path: "/models/org-structure",
    description:
      "Design and optimize reporting hierarchies and span of control.",
    icon: Hierarchy,
    color: "text-pes-600 bg-pes-50",
  },
  "Personnel Redundancy": {
    path: "/models/personnel-redundancy",
    description: "Calculate potential staff redundancy levels based on load.",
    icon: People,
    color: "text-purple-500 bg-purple-50",
  },
  "Personnel Utilization": {
    path: "/models/personnel-utilization",
    description:
      "Measure workforce efficiency and resource utilization ratios.",
    icon: Data,
    color: "text-emerald-500 bg-emerald-50",
  },
  "Productivity Index": {
    path: "/models/productivity-index",
    description: "Track overall organizational productivity and output rates.",
    icon: Graph,
    color: "text-teal-500 bg-teal-50",
  },
  "Redundancy Index": {
    path: "/models/redundancy-index",
    description: "Determine exact redundancy thresholds across departments.",
    icon: TextBlock,
    color: "text-fuchsia-500 bg-fuchsia-50",
  },
  "Staff Number": {
    path: "/models/staff-number",
    description: "Estimate optimal staffing requirements and capacities.",
    icon: People,
    color: "text-sky-500 bg-sky-50",
  },
  "Staff number": {
    path: "/models/staff-number",
    description: "Estimate optimal staffing requirements and capacities.",
    icon: People,
    color: "text-sky-500 bg-sky-50",
  },
  "Student Teacher": {
    path: "/models/student-teacher",
    description:
      "Analyze student-to-teacher ratios and classroom distribution.",
    icon: Book1,
    color: "text-cyan-500 bg-cyan-50",
  },
  "Utility Index": {
    path: "/models/utility-index",
    description:
      "Evaluate overarching institutional utility and value delivery.",
    icon: Verify,
    color: "text-lime-600 bg-lime-50",
  },
  "Maintenance model": {
    path: "/maintenance",
    description: "Plan and track equipment maintenance intervals.",
    icon: Setting2,
    color: "text-slate-600 bg-slate-100",
  },
};

export default function ModelsPage() {
  const router = useRouter();
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const access_token = getAccessToken();

    if (!access_token) {
      router.push("/login");
      return;
    }

    try {
      const decoded_token = jwtDecode<UserToken>(access_token);
      setProductDetails({
        productCategory: decoded_token?.productCategory,
        productPlan: decoded_token?.productPlan,
      });
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const getRoutes = () => {
    if (!productDetails) return [];

    const categoryConfig = planConfigs[productDetails.productCategory];
    if (!categoryConfig) return [];

    const planRoutes = categoryConfig[productDetails.productPlan];
    return planRoutes || [];
  };

  const filteredRoutes = getRoutes();

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pes border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen bg-canvas/50">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-strong tracking-tight">
          Mathematical Models
        </h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          Select a model to begin analysis. These operations research and HR
          algorithms process your data to yield insights on structure, capacity,
          and workforce performance.
        </p>
      </div>

      {filteredRoutes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-line p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-4">
            <Hierarchy className="text-muted" size={32} />
          </div>
          <h3 className="text-lg font-medium text-strong mb-1">
            No Models Available
          </h3>
          <p className="text-muted">
            Your current plan ({productDetails?.productPlan}) does not include
            access to these mathematical models.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route, index) => {
            const def = modelDefinitions[route];
            if (!def) return null;
            const Icon = def.icon;

            return (
              <Link
                key={index}
                href={def.path}
                className="group relative bg-white border border-line rounded-2xl p-6 hover:shadow-xl hover:border-pes/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-pes/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div className="flex items-start justify-between relative z-10">
                  <div
                    className={`p-3 rounded-xl ${def.color} transition-colors duration-300`}
                  >
                    <Icon size={26} variant="Bulk" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center group-hover:bg-pes group-hover:text-white transition-colors duration-300">
                    <ArrowRight2
                      size={16}
                      className="text-muted group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                </div>

                <div className="mt-6 relative z-10 grow">
                  <h3 className="text-lg font-semibold text-strong group-hover:text-pes transition-colors duration-200">
                    {route}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                    {def.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
