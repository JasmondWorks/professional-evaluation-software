import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertStyles = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm flex gap-3 [&>svg]:mt-0.5 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-canvas border-line text-body",
        brand: "bg-pes-50 border-pes-100 text-pes-700",
        success: "bg-success-50 border-success-100 text-success-700",
        warning: "bg-warning-50 border-warning-100 text-warning-700",
        danger: "bg-danger-50 border-danger-100 text-danger-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Alert({
  tone,
  icon,
  title,
  children,
  className,
  ...props
}: {
  tone?: VariantProps<typeof alertStyles>["tone"];
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="alert" className={cn(alertStyles({ tone }), className)} {...props}>
      {icon}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5 opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}
