"use client";
import Link from "next/link";

type EntrySectionProps = {
  title: string;
  to: string;
  disabled?: boolean;
};

export function EntrySection({ title, to, disabled = false }: EntrySectionProps) {
  return (
    <Link
      href={to}
      className={`${disabled ? "pointer-events-none" : ""}`}
      // `pointer-events-none` ensures the link is not clickable when disabled
    >
      <div
        className={`w-full bg-white rounded-md shadow mb-4 flex justify-between items-center p-4
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
      >
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-sm">{">"}</span>
      </div>
    </Link>
  );
}
