import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Simple, accessible breadcrumb. Pass items; the last is rendered as the current
 * page. Example: <Breadcrumb items={[{label:'Models', href:'/models'},{label:'Stress'}]} />
 */
export type Crumb = { label: React.ReactNode; href?: string };

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex items-center flex-wrap gap-1.5 text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-pes-700 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(last && "text-strong font-medium")} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!last && <span className="text-line select-none">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
