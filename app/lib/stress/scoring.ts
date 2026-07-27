// Pure stress-scoring math. No React, no DB — just functions over numbers, so
// it can be reused by the forms, the "Run Setting" step, and the evaluation,
// and unit-tested in isolation. This is the ONLY place the formulas live.

import {
  CategoryKey,
  CATEGORY_KEYS,
  CATEGORY_MAX,
  STRESS_INSTRUMENT,
  STRESS_CATEGORIES,
  PRESSURE_CATEGORIES,
  CONFLICT_CATEGORIES,
} from './instrument';

export type CategoryValues = Record<CategoryKey, number>;

// One item's score: a 1–10 choice mapped onto that item's max. (10 → full max.)
export const scoreItem = (choice: number, max: number): number =>
  (Math.max(0, Math.min(10, choice || 0)) / 10) * max;

// Sum an item-choice map ({ "Time": 8, "Paper Work": 3, … }) into per-category
// totals, using the fixed instrument weights. This is how Form 5 turns a staff
// member's answers into their 10 category values.
export function categoryValuesFromChoices(
  choices: Record<string, number>,
): CategoryValues {
  const out = {} as CategoryValues;
  for (const cat of STRESS_INSTRUMENT) {
    out[cat.key] = cat.items.reduce(
      (sum, item) => sum + scoreItem(choices[item.label] ?? 0, item.max),
      0,
    );
  }
  return out;
}

// Same idea but when each category shares ONE max (Form 6 / themes, where the
// max is the limit computed from Form 5). `choicesByCat` is the 1–10 pick per
// category; each maps onto that category's limit.
export function categoryValuesAgainstLimits(
  choicesByCat: Partial<Record<CategoryKey, number>>,
  limits: Record<CategoryKey, number>,
): CategoryValues {
  const out = {} as CategoryValues;
  for (const key of CATEGORY_KEYS) {
    out[key] = scoreItem(choicesByCat[key] ?? 0, limits[key] ?? 0);
  }
  return out;
}

// Mean of each category across all staff — the output of "Run Setting". These
// per-category means become the max limits used by Form 6.
export function meanLimits(staffValues: CategoryValues[]): CategoryValues {
  const out = {} as CategoryValues;
  const n = staffValues.length || 1;
  for (const key of CATEGORY_KEYS) {
    out[key] = staffValues.reduce((s, v) => s + (v[key] ?? 0), 0) / n;
  }
  return out;
}

// Scale a set of category values to 0–100 against their maxes:
//   (Σ values / Σ maxes) × 100.
export function normalizeTo100(
  values: CategoryValues,
  keys: CategoryKey[] = CATEGORY_KEYS,
  maxes: Record<CategoryKey, number> = CATEGORY_MAX,
): number {
  const totalValue = keys.reduce((s, k) => s + (values[k] ?? 0), 0);
  const totalMax = keys.reduce((s, k) => s + (maxes[k] ?? 0), 0);
  if (totalMax === 0) return 0;
  return (totalValue / totalMax) * 100;
}

// The three headline factors for one staff member (each 0–100), computed the
// same way — normalize the relevant subset of categories against their maxes.
export function factors(
  values: CategoryValues,
  maxes: Record<CategoryKey, number> = CATEGORY_MAX,
): { stress: number; pressure: number; conflict: number } {
  return {
    stress: normalizeTo100(values, STRESS_CATEGORIES, maxes),
    pressure: normalizeTo100(values, PRESSURE_CATEGORIES, maxes),
    conflict: normalizeTo100(values, CONFLICT_CATEGORIES, maxes),
  };
}

export const mean = (arr: number[]): number =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
