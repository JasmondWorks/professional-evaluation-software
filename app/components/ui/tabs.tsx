"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// The one tab bar.
//
// Three pages had each grown their own — an underlined row here, a dark navbar
// with yellow accents there — so the same control looked like a different one on
// every screen. This is the shape the employee database uses, and it is now the
// only one.
//
// Which tab is open also belongs in the URL. Reloading a page, sharing a link,
// or pressing Back all used to drop you on the first tab, because the choice
// lived in component state and nowhere else. Two ways to fix that, depending on
// whether the tabs are one page or several:
//
//   <Tabs syncParam="tab">      — panels on one route, stored in ?tab=
//   <RouteTabs items={[…]} />   — genuinely separate routes, one per tab

// Shared with RouteTabs so a routed tab bar and a stateful one are the same
// control to look at.
const listBase =
  "inline-flex items-center gap-1 rounded-lg bg-line/50 p-1 text-muted";
const triggerBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 hover:text-strong";

const TabsRoot = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(listBase, className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      triggerBase,
      "data-[state=active]:bg-surface data-[state=active]:text-pes-700 data-[state=active]:shadow-xs",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/**
 * Tabs whose open panel is remembered in the URL.
 *
 * Pass `syncParam` and the value lives in that search param, so a reload, a
 * shared link and the Back button all land on the tab the reader was looking at.
 * Without it this behaves exactly like the Radix root.
 *
 * `defaultValue` is the tab to fall back to when the param is absent. The param
 * is written with `replace`, so tab switching does not fill the history stack
 * with entries the Back button has to walk through.
 */
function Tabs({
  syncParam,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  /** Search param to store the open tab in, e.g. "tab". */
  syncParam?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!syncParam) {
    return (
      <TabsRoot
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        {...props}
      />
    );
  }

  const fromUrl = searchParams.get(syncParam);
  // A stale or hand-edited param must not leave every panel closed, so an
  // unknown value falls back to the default.
  const current = fromUrl ?? (value as string) ?? (defaultValue as string);

  // Push the URL's choice back into the caller's own state. Some pages render
  // their panels from that state rather than from TabsContent, and without this
  // a link to ?tab=results would highlight the right tab while still showing the
  // first panel's content.
  React.useEffect(() => {
    if (fromUrl && fromUrl !== value) onValueChange?.(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(syncParam, next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onValueChange?.(next);
  };

  return <TabsRoot value={current} onValueChange={handleChange} {...props} />;
}

/**
 * Tabs that are really separate routes — the panels live at their own URLs
 * rather than in one page's state.
 *
 * `href` matches when the path equals it, or when `match: "prefix"` is set and
 * the path sits underneath it, so /evaluation/staff/sampling still lights up the
 * "Staff determination" tab.
 */
function RouteTabs({
  items,
  className,
}: {
  items: {
    href: string;
    label: React.ReactNode;
    /** "exact" (default) or "prefix" for a tab with routes nested under it. */
    match?: "exact" | "prefix";
  }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn(listBase, className)} aria-label="Sections">
      {items.map((item) => {
        const active =
          item.match === "prefix"
            ? pathname === item.href || pathname.startsWith(item.href + "/")
            : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              triggerBase,
              active && "bg-surface text-pes-700 shadow-xs",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, RouteTabs };
