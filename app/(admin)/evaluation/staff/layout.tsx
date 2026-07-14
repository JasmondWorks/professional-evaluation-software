"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/evaluation/staff", label: "Plain Estimating", exact: true },
    { href: "/evaluation/staff/factored", label: "Factored Estimating" },
    { href: "/evaluation/staff/sampling", label: "Work Sampling" },
  ];

  return (
    <main className="flex flex-col w-full h-full bg-gray-100">
      <div className="flex flex-wrap gap-2 ms-auto w-fit p-4">
        {tabs.map((t) => {
          const active = t.exact
            ? pathname === t.href
            : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-pes text-white"
                  : "text-gray-600 bg-white border border-gray-200 hover:border-pes hover:text-pes"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </main>
  );
}
