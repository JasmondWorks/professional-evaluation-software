import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, resolving conflicts (last one wins).
 * @example cn("px-2 py-1", condition && "px-4") // -> "py-1 px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*                                    IDs                                      */
/* -------------------------------------------------------------------------- */

/**
 * Format a raw ID into a padded, prefixed, human-readable code.
 * @example formatId(42, { prefix: "EMP" }) // -> "EMP-0042"
 */
export function formatId(
  id: string | number,
  {
    prefix = "",
    length = 4,
    separator = "-",
  }: { prefix?: string; length?: number; separator?: string } = {},
) {
  const padded = String(id).padStart(length, "0");
  return prefix ? `${prefix}${separator}${padded}` : padded;
}

/**
 * Truncate a long ID (e.g. a UUID or token) for compact display.
 * @example truncateId("a1b2c3d4-e5f6-7890") // -> "a1b2…7890"
 */
export function truncateId(id: string, start = 4, end = 4) {
  if (id.length <= start + end) return id;
  return `${id.slice(0, start)}…${id.slice(-end)}`;
}

/* -------------------------------------------------------------------------- */
/*                                   Dates                                     */
/* -------------------------------------------------------------------------- */

/**
 * Format a date as a readable string.
 * @example formatDate(new Date()) // -> "5 Jul 2026"
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
  locale = "en-GB",
) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a date with time.
 * @example formatDateTime(new Date()) // -> "5 Jul 2026, 14:30"
 */
export function formatDateTime(
  date: Date | string | number,
  locale = "en-GB",
) {
  return formatDate(
    date,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    locale,
  );
}

/**
 * Human-readable relative time.
 * @example formatRelativeTime(Date.now() - 60_000) // -> "1 minute ago"
 */
export function formatRelativeTime(date: Date | string | number, locale = "en") {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];

  let duration = diffSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
}

/* -------------------------------------------------------------------------- */
/*                                 Currency                                    */
/* -------------------------------------------------------------------------- */

/**
 * Format a number as currency.
 * @example formatCurrency(1500) // -> "₦1,500.00"
 */
export function formatCurrency(
  amount: number,
  {
    currency = "NGN",
    locale = "en-NG",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  }: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/* -------------------------------------------------------------------------- */
/*                                  Numbers                                    */
/* -------------------------------------------------------------------------- */

/**
 * Format a number with thousands separators.
 * @example formatNumber(1234567) // -> "1,234,567"
 */
export function formatNumber(value: number, locale = "en") {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Compact number formatting.
 * @example formatCompactNumber(12500) // -> "12.5K"
 */
export function formatCompactNumber(value: number, locale = "en") {
  return new Intl.NumberFormat(locale, { notation: "compact" }).format(value);
}

/**
 * Format a 0–1 ratio (or a raw percentage) as a percentage string.
 * @example formatPercent(0.842) // -> "84.2%"
 */
export function formatPercent(value: number, fractionDigits = 1, locale = "en") {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/* -------------------------------------------------------------------------- */
/*                                   Text                                      */
/* -------------------------------------------------------------------------- */

/**
 * Capitalise the first letter of a string.
 * @example capitalize("hello") // -> "Hello"
 */
export function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to Title Case.
 * @example titleCase("industrial-engineer") // -> "Industrial Engineer"
 */
export function titleCase(str: string) {
  if (!str) return "";
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(capitalize)
    .join(" ");
}

/**
 * Build initials from a full name.
 * @example getInitials("Grace Thompson") // -> "GT"
 */
export function getInitials(name: string, max = 2) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Truncate text to a maximum length with an ellipsis.
 * @example truncate("A long sentence", 6) // -> "A long…"
 */
export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength).trimEnd()}…`;
}
