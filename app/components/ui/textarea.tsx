"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-20 px-3 py-2 rounded-lg bg-surface border border-line text-strong text-sm",
        "placeholder:text-muted transition-shadow resize-y",
        "focus:outline-none focus:border-pes-400 focus:shadow-focus",
        "disabled:bg-line/40 disabled:text-muted disabled:cursor-not-allowed",
        "aria-[invalid=true]:border-danger-600",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
