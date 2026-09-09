/** The subscription catalogue: the single source of truth for what an
 *  organization can buy, at what price, and what it unlocks.
 *
 *  Before this file the same information lived in four places that disagreed
 *  with each other: PLAN_CODES in app/signup/page.tsx (Paystack codes), the
 *  `amounts` map in app/api/signup/route.ts (100/200/300), packages.js
 *  (10000/20000/50000 cents) and the WordPress product page (a different price
 *  per institution type). Only this file should be read from now on.
 *
 *  Prices are in whole US cents to avoid float drift, and they are per
 *  institution type because that is how the product is actually sold. */

export const INSTITUTION_TYPES = ['ACADEMIC', 'COMPANY', 'PUBLIC'] as const;
export const PLAN_TYPES = ['BASIC', 'STANDARD', 'PREMIUM'] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];
export type PlanType = (typeof PLAN_TYPES)[number];

export type Plan = {
  name: PlanType;
  /** Price in US cents. */
  price: number;
  currency: 'USD';
  /** How long one payment buys. Everything renews yearly today. */
  interval: 'YEAR';
  intervalCount: number;
  /** The PayPal billing plan this maps to. Null until it is created in the
   *  PayPal catalogue for this institution type — which is exactly what a
   *  missing price means today, so null here and price 0 above travel
   *  together. These are SANDBOX ids: PAYPAL_SANDBOX=true in every
   *  environment, and going live means creating the catalogue again against
   *  live credentials and replacing all of them. */
  paypalPlanId: string | null;
  /** Evaluation models unlocked, matching the checkmark lists on the
   *  WordPress product page. These are the keys used by org.evaluation. */
  features: string[];
};

export type Subscription = {
  id: string;
  institutionType: InstitutionType;
  /** The PayPal catalogue product these plans hang off. A billing plan cannot
   *  be created without one, so it is recorded here rather than rediscovered.
   *  SANDBOX ids — the live catalogue is a separate set. */
  paypalProductId: string | null;
  plans: Plan[];
};

const YEARLY = { currency: 'USD', interval: 'YEAR', intervalCount: 1 } as const;

export const CATALOG: Subscription[] = [
  {
    id: 'sub_academic',
    institutionType: 'ACADEMIC',
    paypalProductId: 'PROD-25456155FY6547134',
    plans: [
      { name: 'BASIC', price: 3571, ...YEARLY, paypalPlanId: 'P-8CA45489CF404270LNKQYXYQ', features: ['appraisal'] },
      { name: 'STANDARD', price: 0, ...YEARLY, paypalPlanId: null, features: ['appraisal', 'performance'] },
      { name: 'PREMIUM', price: 0, ...YEARLY, paypalPlanId: null, features: ['appraisal', 'performance', 'stress', 'motivation'] },
    ],
  },
  {
    id: 'sub_company',
    institutionType: 'COMPANY',
    paypalProductId: 'PROD-8SS07929LW2250519',
    plans: [
      { name: 'BASIC', price: 5357, ...YEARLY, paypalPlanId: 'P-1JF58806V3116300LNKQYXYY', features: ['appraisal'] },
      { name: 'STANDARD', price: 11429, ...YEARLY, paypalPlanId: 'P-9CK00926DY0827308NKQYXZA', features: ['appraisal', 'performance'] },
      { name: 'PREMIUM', price: 22857, ...YEARLY, paypalPlanId: 'P-1M005614YK583653VNKQYXZI', features: ['appraisal', 'performance', 'stress', 'motivation'] },
    ],
  },
  {
    id: 'sub_public',
    institutionType: 'PUBLIC',
    paypalProductId: 'PROD-5FS316841V737145L',
    plans: [
      { name: 'BASIC', price: 4286, ...YEARLY, paypalPlanId: 'P-9GS4991057671020GNKQYXZY', features: ['appraisal'] },
      { name: 'STANDARD', price: 10000, ...YEARLY, paypalPlanId: 'P-9KR58657E9745801RNKQYXZY', features: ['appraisal', 'performance'] },
      { name: 'PREMIUM', price: 0, ...YEARLY, paypalPlanId: null, features: ['appraisal', 'performance', 'stress', 'motivation'] },
    ],
  },
];

/** URL parameters arrive lower case ("academic", "premium"). Normalise and
 *  reject anything not in the catalogue, so a hand-typed URL cannot invent an
 *  institution type or a plan tier. */
export function normalizeInstitution(value: string | null): InstitutionType | null {
  const upper = (value ?? '').trim().toUpperCase();
  return (INSTITUTION_TYPES as readonly string[]).includes(upper)
    ? (upper as InstitutionType)
    : null;
}

export function normalizePlan(value: string | null): PlanType | null {
  const upper = (value ?? '').trim().toUpperCase();
  return (PLAN_TYPES as readonly string[]).includes(upper) ? (upper as PlanType) : null;
}

export function findPlan(institution: InstitutionType, plan: PlanType): Plan | null {
  return CATALOG.find((s) => s.institutionType === institution)?.plans
    .find((p) => p.name === plan) ?? null;
}

/** Which evaluation models this institution type and tier may use. Used to gate
 *  the API, not just the menu. */
export function featuresFor(institution: InstitutionType, plan: PlanType): string[] {
  return findPlan(institution, plan)?.features ?? [];
}
