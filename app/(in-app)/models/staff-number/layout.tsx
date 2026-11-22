"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModelAccess, hasEntitlement } from "@/app/components/useModelAccess";
import type { EntitlementKey } from "@/app/lib/billing/entitlements";

// The three methods are sold separately, and not as a ladder: the product plan
// gives Basic the plain method only, Standard plain and factored, and Premium
// factored and work sampling — so Premium does NOT include method 1. The tab
// for a method the plan excludes is not rendered, and reaching its URL directly
// gets the same refusal the server would give.
const navItems: { label: string; href: string; entitlement: EntitlementKey }[] = [
  {
    label: "Method 1: Plain Estimating",
    href: "/models/staff-number",
    entitlement: "staff-number.plain",
  },
  {
    label: "Method 2: Factored Estimating",
    href: "/models/staff-number/method2",
    entitlement: "staff-number.factored",
  },
  {
    label: "Method 3: Work Sampling",
    href: "/models/staff-number/method3",
    entitlement: "staff-number.work-sampling",
  },
];

export default function StaffNumberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const access = useModelAccess();

  const available = navItems.filter((i) => hasEntitlement(access, i.entitlement));

  // Longest href first, so /models/staff-number/method2 is not read as the
  // index page's method 1.
  const current = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

  if (access.loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pes border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const entitled = !current || hasEntitlement(access, current.entitlement);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-canvas border-b p-4 flex gap-4">
        {available.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded ${
              pathname === item.href ? "bg-pes text-white" : "bg-white border text-body"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        {entitled ? (
          children
        ) : (
          <div className="p-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-dashed border-line p-12 text-center shadow-sm">
              <h1 className="text-lg font-medium text-strong mb-2">
                {current?.label} is not in your plan
              </h1>
              <p className="text-muted text-sm max-w-md mx-auto">
                Your organization&apos;s plan includes{" "}
                {available.length
                  ? available.map((a) => a.label.replace(/^Method \d: /, "")).join(" and ")
                  : "no method of this model"}
                .
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {available[0] && (
                  <Link
                    href={available[0].href}
                    className="text-sm font-medium text-pes-600 hover:text-pes-700"
                  >
                    Open {available[0].label.replace(/^Method \d: /, "")}
                  </Link>
                )}
                <span className="text-line">•</span>
                <Link
                  href="/help#plans"
                  className="text-sm font-medium text-pes-600 hover:text-pes-700"
                >
                  What each plan includes
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
