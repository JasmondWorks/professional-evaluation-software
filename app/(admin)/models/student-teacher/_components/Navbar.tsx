"use client";

import { BackLink } from "@/app/components/ui";
import { RouteTabs } from "@/app/components/ui/tabs";

// This was a dark bar with yellow accents — the only one in the product, and
// nothing to do with the rest of the models. It is now the shared header shape.
export default function NavBar() {
  return (
    <div className="mb-8 border-b border-line bg-surface px-4 pt-6 sm:px-6">
      <BackLink href="/models">Back to models</BackLink>
      <h1 className="text-xl font-semibold tracking-tight text-strong sm:text-2xl">
        Student–teacher optimization
      </h1>
      <div className="mt-3 pb-3">
        <RouteTabs
          items={[
            { href: "/models/student-teacher/ordinary", label: "Ordinary optimization" },
            { href: "/models/student-teacher/robust", label: "Robust optimization" },
          ]}
        />
      </div>
    </div>
  );
}
