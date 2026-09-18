// Shared score → class banding for staff results.
//
// The bands mirror the ones already used on the staff Performance Review page
// (/performance), so a score reads the same wherever it is shown. Kept here so
// the employee record and the staff view cannot drift apart.

import type { BadgeTone } from '@/app/components/ui/Badge';

export type Band = {
  label: string; // e.g. "1st class (Excellent)"
  short: string; // e.g. "Excellent"
  tone: BadgeTone;
  text: string; // token text class for inline figures
};

const EXCELLENT: Band = { label: '1st class (Excellent)', short: 'Excellent', tone: 'brand', text: 'text-pes-700' };
const GOOD: Band = { label: '2nd class (Good)', short: 'Good', tone: 'success', text: 'text-success-700' };
const FAIR: Band = { label: '3rd class (Fair)', short: 'Fair', tone: 'warning', text: 'text-warning-700' };
const POOR: Band = { label: '4th class (Poor)', short: 'Poor', tone: 'danger', text: 'text-danger-700' };

export function band(score: number): Band {
  if (score >= 80) return EXCELLENT;
  if (score >= 70) return GOOD;
  if (score >= 50) return FAIR;
  return POOR;
}

// Format a percentage figure for display; null-safe so "no score" never renders
// as "0.00%" (which would read as a real, bad result).
export function pct(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return `${Number(value).toFixed(2)}%`;
}
