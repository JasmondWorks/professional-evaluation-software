"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Controlled pagination. Renders first/last, a windowed page range with
 * ellipses, and worded Previous/Next. `page` is 1-indexed.
 *
 * It renders even for a single page. A control that disappears when the data is
 * short makes the table's footer jump as rows are filtered, and leaves the
 * reader unsure whether there is more to see.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}) {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const pages: (number | "ellipsis")[] = [];
  const left = Math.max(2, page - siblingCount);
  const right = Math.min(pageCount - 1, page + siblingCount);
  pages.push(1);
  if (left > 2) pages.push("ellipsis");
  pages.push(...range(left, right).filter((p) => p > 1 && p < pageCount));
  if (right < pageCount - 1) pages.push("ellipsis");
  if (pageCount > 1) pages.push(pageCount);

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-surface px-2.5 text-sm font-medium text-body transition-colors hover:bg-line/50 hover:text-strong disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:shadow-focus";

  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1.5", className)}>
      <button
        className={cn(btn, "px-3")}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} className="grid h-9 w-9 place-items-center text-muted">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(btn, p === page && "bg-pes text-white border-pes hover:bg-pes-800 hover:text-white")}
          >
            {p}
          </button>
        ),
      )}
      <button
        className={cn(btn, "px-3")}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
      </button>
    </nav>
  );
}
