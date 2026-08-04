"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { inputBase } from "./Input";

/**
 * Token-themed wrapper over the native datetime-local / date / time inputs.
 * Native pickers are the most reliable + accessible; this just standardizes the
 * styling. `type` defaults to "datetime-local".
 */
export type DateTimeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  type?: "datetime-local" | "date" | "time" | "month" | "week";
};

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, type = "datetime-local", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputBase, "appearance-none", className)}
      {...props}
    />
  ),
);
DateTimeInput.displayName = "DateTimeInput";

export { DateTimeInput };
