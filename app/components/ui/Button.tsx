import React, { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "px-4 py-3 flex justify-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300",
  {
    variants: {
      variant: {
        primary: "bg-pes text-white hover:bg-pes/80",
        secondary: "bg-white text-pes border border-gray-200 hover:bg-gray-50",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gray-200 text-gray-700 hover:bg-gray-50",
        ghost:
          "bg-transparent border-transparent shadow-none hover:bg-gray-50 px-0 py-0 w-fit text-pes hover:text-pes/80",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export default function Button({
  onClick,
  children,
  disabled,
  className,
  href,
  variant,
  type,
  tabIndex,
  ...props
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  href?: string;
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
  type?: "button" | "submit" | "reset";
  props?: ButtonHTMLAttributes<HTMLButtonElement>;
  tabIndex?: number;
}) {
  const styles = cn(buttonStyles({ variant }), className);

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={styles}
      disabled={disabled}
      onClick={onClick}
      tabIndex={tabIndex}
      {...props}
    >
      {children}
    </button>
  );
}
