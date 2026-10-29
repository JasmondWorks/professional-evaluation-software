"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Filter, CloseCircle, SearchNormal1 } from "iconsax-react";
import { apiFetch } from "@/app/utils/apiFetch";
import { Alert, Badge, Card, PageHeader, Pagination } from "@/app/components/ui";
import Table from "@/app/components/ui/Table";
import type { TableColumn } from "@/app/components/ui/Table";
import { inputBase } from "@/app/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { cn } from "@/lib/utils";

type OrgRow = {
  id: number;
  name: string;
  category: string;
  plan: string;
  created_at: string | null;
  userCount: number;
};

type Filters = {
  plan: string | null;
  category: string | null;
};

const EMPTY_FILTERS: Filters = { plan: null, category: null };
const PAGE_SIZE = 10;

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-pes-50 py-1 pl-2.5 pr-1.5 text-xs font-medium capitalize text-pes-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 text-pes-700/70 hover:bg-pes-100 hover:text-pes-800"
      >
        <CloseCircle size={14} variant="Bold" />
      </button>
    </span>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? null : v)}>
        <SelectTrigger>
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="capitalize">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function OrgFilters({
  filters,
  onApply,
  planOptions,
  categoryOptions,
}: {
  filters: Filters;
  onApply: (next: Filters) => void;
  planOptions: string[];
  categoryOptions: string[];
}) {
  const [open, setOpen] = useState(false);
  // Draft state: changes inside the popover (including picking "All") only
  // take effect once "Apply filters" is pressed, so flipping through a few
  // options doesn't re-query the server on every click.
  const [draft, setDraft] = useState<Filters>(filters);
  const activeCount = Object.values(filters).filter(Boolean).length;

  function openChange(next: boolean) {
    if (next) setDraft(filters); // start the draft from what's actually applied
    setOpen(next);
  }

  function apply() {
    onApply(draft);
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.plan && (
        <FilterChip label={`Plan: ${filters.plan}`} onRemove={() => onApply({ ...filters, plan: null })} />
      )}
      {filters.category && (
        <FilterChip
          label={`Category: ${filters.category}`}
          onRemove={() => onApply({ ...filters, category: null })}
        />
      )}

      <PopoverPrimitive.Root open={open} onOpenChange={openChange}>
        <PopoverPrimitive.Trigger
          className={cn(
            "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-body shadow-xs transition-colors hover:bg-line/50",
            "focus-visible:outline-none focus-visible:shadow-focus",
          )}
        >
          <Filter size={16} />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-pes-600 px-1 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="end"
            sideOffset={8}
            className={cn(
              "z-popover w-72 rounded-xl border border-line bg-surface p-4 shadow-md",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            )}
          >
            <div className="flex flex-col gap-4">
              <FilterSelect
                label="Plan"
                value={draft.plan}
                options={planOptions}
                onChange={(v) => setDraft({ ...draft, plan: v })}
              />
              <FilterSelect
                label="Category"
                value={draft.category}
                options={categoryOptions}
                onChange={(v) => setDraft({ ...draft, category: v })}
              />
              <button
                type="button"
                onClick={apply}
                className="mt-1 inline-flex h-9 items-center justify-center rounded-lg bg-pes text-sm font-medium text-white shadow-xs transition-colors hover:bg-pes-800"
              >
                Apply filters
              </button>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facets, setFacets] = useState<{ plans: string[]; categories: string[] }>({ plans: [], categories: [] });

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // Debounce the search box so every keystroke doesn't fire a request.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Any change to search or filters invalidates the current page.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (filters.plan) params.set("plan", filters.plan);
    if (filters.category) params.set("category", filters.category);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    apiFetch(`/api/admin/orgs-overview?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load organizations");
        }
        return res.json();
      })
      .then((body) => {
        setOrgs(body.data);
        setTotal(body.total);
        setFacets(body.facets);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [debouncedQuery, filters, page]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: TableColumn<OrgRow>[] = [
    { key: "name", label: "Name", render: (org) => <span className="font-medium text-strong">{org.name}</span> },
    { key: "category", label: "Category", render: (org) => <span className="capitalize">{org.category}</span> },
    { key: "plan", label: "Plan", render: (org) => <span className="capitalize">{org.plan}</span> },
    { key: "userCount", label: "Users", align: "center" },
    {
      key: "created_at",
      label: "Created",
      render: (org) => (org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Organizations"
        subtitle={`${total} organization${total === 1 ? "" : "s"} on the platform`}
      />

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : (
        <Card>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <SearchNormal1
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search organizations…"
                  aria-label="Search organizations"
                  className={cn(inputBase, "pl-9")}
                />
              </div>
              <OrgFilters
                filters={filters}
                onApply={setFilters}
                planOptions={facets.plans}
                categoryOptions={facets.categories}
              />
            </div>

            <Table
              columns={columns}
              data={orgs}
              loading={loading}
              emptyMessage={
                query || filters.plan || filters.category
                  ? "No organizations match your search and filters."
                  : "No organizations yet."
              }
              onRowClick={(org) => router.push(`/organizations/${org.id}`)}
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted">
                Showing{" "}
                <span className="font-medium text-body tabular-nums">
                  {total === 0 ? 0 : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
                </span>{" "}
                of <span className="font-medium text-body tabular-nums">{total}</span>{" "}
                {total === 1 ? "organization" : "organizations"}
              </p>
              <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
