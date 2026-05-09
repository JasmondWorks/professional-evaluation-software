"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/models/student-teacher/ordinary", label: "Ordinary Optimization" },
    { href: "/models/student-teacher/robust", label: "Robust Optimization" },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-md mb-8">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold tracking-wide">
          Student–Teacher Optimization
        </h1>

        <div className="flex space-x-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  isActive
                    ? "text-yellow-400 border-b-2 border-yellow-400 pb-1"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
