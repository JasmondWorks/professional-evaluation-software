import React from "react";
import { cn } from "@/lib/utils";

/**
 * The canonical surface container: white surface, hairline border, soft
 * offset-blur depth. One radius, one shadow — so cards stop drifting across
 * rounded-md / xl / 2xl. Set `interactive` for hover lift on clickable cards.
 */
export function Card({
  children,
  className,
  interactive,
  as: Tag = "div",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  as?: any;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Tag
      className={cn(
        "bg-surface border border-line rounded-xl shadow-card",
        interactive &&
          "transition-[box-shadow,border-color,transform] duration-200 hover:shadow-md hover:border-pes-200 hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-5 py-4 border-b border-line", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export default Card;
