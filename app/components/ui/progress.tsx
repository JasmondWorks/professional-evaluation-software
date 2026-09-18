"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Determinate progress bar. `value` is 0–100. Token-themed; use `tone` for
 * status-colored bars.
 */
const tones = {
  brand: "bg-pes",
  success: "bg-success-600",
  warning: "bg-warning-600",
  danger: "bg-danger-600",
} as const;

export function Progress({
  value = 0,
  tone = "brand",
  className,
  ...props
}: {
  value?: number;
  tone?: keyof typeof tones;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300 ease-out", tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
