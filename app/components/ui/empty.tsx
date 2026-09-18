import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Empty-state block: centered icon + title + description + optional action.
 * Use for "no results / nothing here yet" surfaces.
 */
export function Empty({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-line bg-surface px-6 py-12",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-canvas text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-strong">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
