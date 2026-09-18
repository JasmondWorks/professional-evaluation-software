import React from "react";
import { cn } from "@/lib/utils";

// Static, purge-safe tone map. This replaces the old dynamic
// `bg-${color}-100 text-${color}-500` pattern, which Tailwind cannot see at
// build time (so those colors often failed to render at all).
const tones = {
  neutral: "bg-line/60 text-body",
  brand: "bg-pes-50 text-pes-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  info: "bg-pes-50 text-pes-600",
} as const;

export type BadgeTone = keyof typeof tones;

export default function Badge({
  children,
  tone = "neutral",
  dot,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  );
}
