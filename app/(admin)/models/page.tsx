"use client";

import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

// 1. Define Types for your Token and Configs
interface UserToken {
  productCategory: string;
  productPlan: string;
  [key: string]: any; // Allow other JWT fields
}

type ProductDetails = {
  productCategory: string;
  productPlan: string;
};

// 2. Move static configuration OUTSIDE the component to prevent re-creation on every render
const planConfigs: Record<string, Record<string, string[]>> = {
  public: {
    basic: ["Personnel Utilization", "Productivity Index", "Student Teacher", "Staff Number", "Stress"],
    standard: ["Personnel Utilization", "Productivity Index", "Student Teacher", "Staff number", "Stress", "Appraisal"],
    premium: ["Personnel Utilization", "Productivity Index", "Student Teacher", "Staff number", "Stress", "Appraisal", "Organization Structure", "Performance", "Motivation"],
  },
  company: {
    basic: ["Staff Number", "Stress", "Appraisal"],
    standard: ["Staff Number", "Stress", "Appraisal", "Organization Structure", "Performance", "Motivation"],
    premium: ["Staff Number", "Stress", "Appraisal", "Organization Structure", "Performance", "Motivation", "Personnel Utilization", "Productivity Index", "Redundancy Index"],
  },
  academic: {
    basic: ["Student Teacher", "Stress", "Appraisal", "Non-Academic Appraisal", "Motivation", "Maintenance model"],
    standard: ["Student Teacher", "Stress", "Appraisal", "Non-Academic Appraisal", "Motivation", "Maintenance model", "Organization Structure", "Performance"],
    premium: ["Student Teacher", "Stress", "Appraisal", "Non-Academic Appraisal", "Motivation", "Maintenance model", "Organization Structure", "Performance", "Personnel Utilization", "Productivity Index", "Staff Number", "Redundancy Index"],
  },
};

const routesAlt: Record<string, string> = {
  "Performance": "/models/performance",
  "Appraisal": "/models/appraisal",
  "Motivation": "/models/motivation",
  "Stress": "/models/stress",
  "Non-Academic Appraisal": "/models/non-academic-appraisal",
  "Organization Structure": "/models/org-structure",
  "Personnel Redundancy": "/models/personnel-redundancy",
  "Personnel Utilization": "/models/personnel-utilization",
  "Productivity Index": "/models/productivity-index",
  "Redundancy Index": "/models/redundancy-index",
  "Staff Number": "/models/staff-number",
  "Student Teacher": "/models/student-teacher",
  "Utility Index": "/models/utility-index",
  "Maintenance model": "/models/maintenance-model", // Added this based on your list
};

export default function ModelsPage() {
  const router = useRouter();
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 3. Added loading state

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");

    if (!access_token) {
      console.log("No valid token found, redirecting...");
      router.push("/login");
      return;
    }

    try {
      const decoded_token = jwtDecode<UserToken>(access_token);
      console.log("Decoded token:", decoded_token);
      // 4. FIX: Correctly mapping plan to plan (was category to plan previously)
      setProductDetails({
        productCategory: decoded_token?.productCategory,
        productPlan: decoded_token?.productPlan, 
      });
    } catch (error) {
      console.error("Invalid token:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 5. Safe Logic: Calculate routes based on state
  const getRoutes = () => {
    if (!productDetails) return [];
    
    const categoryConfig = planConfigs[productDetails.productCategory];
    if (!categoryConfig) return [];

    const planRoutes = categoryConfig[productDetails.productPlan];
    return planRoutes || [];
  };

  const filteredRoutes = getRoutes();

  // 6. Loading UI
  if (isLoading) {
    return <div className="p-8">Loading permissions...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Models</h1>
      
      {filteredRoutes.length === 0 ? (
        <p className="text-gray-500">No models available for your current plan.</p>
      ) : (
        <div className="flex flex-wrap gap-4 mt-1">
          {filteredRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => {
                 const path = routesAlt[route];
                 if (path) router.push(path);
                 else console.warn(`No route defined for ${route}`);
              }}
              // 7. Styling: Converted inline styles to Tailwind
              className="bg-pes text-white py-2 px-5 rounded-md hover:opacity-90 transition-opacity w-fit"
            >
              {route}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}