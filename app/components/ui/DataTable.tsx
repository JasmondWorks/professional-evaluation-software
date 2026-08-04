"use client";

import React, { useMemo, useState } from "react";
import { SearchNormal1 } from "iconsax-react";
import Table, { TableColumn } from "./Table";
import { Pagination } from "./pagination";
import { inputBase } from "./Input";
import { cn } from "@/lib/utils";

/**
 * DataTable — the standard table surface: optional search, client-side
 * pagination, and a toolbar slot, wrapped around the base `Table`.
 * For server-side paging, omit `pageSize` and drive `data` yourself.
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  onRowClick,
  searchable = false,
  searchKeys,
  searchPlaceholder = "Search…",
  pageSize,
  toolbar,
  className,
}: {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  /** Keys to match against when searching. Defaults to all column keys. */
  searchKeys?: string[];
  searchPlaceholder?: string;
  /** Enables client-side pagination at this page size. */
  pageSize?: number;
  toolbar?: React.ReactNode;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const keys = searchKeys ?? columns.map((c) => c.key);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
    );
  }, [data, query, searchable, keys]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const current = Math.min(page, pageCount);
  const paged = pageSize
    ? filtered.slice((current - 1) * pageSize, current * pageSize)
    : filtered;

  // Reset to page 1 whenever the query changes the result set size.
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const showToolbar = searchable || toolbar;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          {searchable ? (
            <div className="relative w-full sm:max-w-xs">
              <SearchNormal1
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search table"
                className={cn(inputBase, "pl-9")}
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar && <div className="flex items-center gap-2 shrink-0">{toolbar}</div>}
        </div>
      )}

      <Table
        columns={columns}
        data={paged}
        loading={loading}
        emptyMessage={query ? `No matches for “${query}”.` : emptyMessage}
        onRowClick={onRowClick}
      />

      {pageSize && filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Showing{" "}
            <span className="font-medium text-body tabular-nums">
              {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)}
            </span>{" "}
            of <span className="font-medium text-body tabular-nums">{filtered.length}</span>
          </p>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

export default DataTable;
