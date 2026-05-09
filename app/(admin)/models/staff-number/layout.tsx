"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StaffNumberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Method 1: Plain Estimating", href: "/models/staff-number" },
    { label: "Method 2: Factored Estimating", href: "/models/staff-number/method2" },
    { label: "Method 3: Work Sampling", href: "/models/staff-number/method3" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-gray-100 border-b p-4 flex gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded ${
              pathname === item.href ? "bg-pes text-white" : "bg-white border text-gray-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Page Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
