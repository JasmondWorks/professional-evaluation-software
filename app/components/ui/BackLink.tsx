"use client";

import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import { cn } from "@/lib/utils";

/**
 * The way back out of a subroute.
 *
 * There were five of these, differing in colour, weight, icon, underline and
 * bottom margin, so the same link looked like a different affordance depending
 * on which page you had reached it from. This is the one shape: the appraisal
 * console's, which reads as a link rather than as dimmed body text.
 *
 * `className` is for layout only — spacing, alignment. Recolouring it here puts
 * the inconsistency straight back.
 */
export default function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-3 inline-flex items-center gap-1 text-sm font-medium text-pes underline underline-offset-4 transition-colors hover:text-pes-800",
        className,
      )}
    >
      <ArrowLeft2 size={16} />
      {children}
    </Link>
  );
}
