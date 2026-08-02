import React, { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg whitespace-nowrap select-none " +
    "transition-[background-color,color,box-shadow,border-color,transform] duration-150 " +
    "active:translate-y-px disabled:opacity-50 disabled:pointer-events-none " +
    "focus-visible:outline-none focus-visible:shadow-focus",
  {
    variants: {
      variant: {
        primary: "bg-pes text-white shadow-xs hover:bg-pes-800",
        secondary:
          "bg-surface text-strong border border-line shadow-xs hover:bg-line/50",
        destructive: "bg-danger-600 text-white shadow-xs hover:bg-danger-700",
        outline: "border border-line text-body bg-transparent hover:bg-line/50",
        ghost: "bg-transparent text-pes-700 hover:bg-pes-50",
        subtle: "bg-pes-50 text-pes-700 hover:bg-pes-100",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-[15px]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = {
  onClick?: (e?: any) => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  tabIndex?: number;
} & VariantProps<typeof buttonStyles> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">;

export default function Button({
  onClick,
  children,
  disabled,
  loading,
  className,
  href,
  variant,
  size,
  type = "button",
  tabIndex,
  ...props
}: ButtonProps) {
  const styles = cn(buttonStyles({ variant, size }), className);

  const content = loading ? (
    <>
      <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {children}
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link href={href} className={styles} tabIndex={tabIndex}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={styles}
      disabled={disabled || loading}
      onClick={onClick}
      tabIndex={tabIndex}
      {...props}
    >
      {content}
    </button>
  );
}
