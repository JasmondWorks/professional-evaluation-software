/** What each product plan unlocks. SERVER AND CLIENT SAFE (no prisma here).
 *
 *  This is the matrix from "PES Product Plan final_090522.docx", one row per
 *  model the document names, transcribed as the positive form: which plans MAY
 *  use it. The document itself is written the other way round — a blank cell
 *  means included and an X means excluded — so read the source table with that
 *  in mind before editing anything here.
 *
 *  Two things the document gates that MODEL_CATALOG does not:
 *
 *    * sub-models. Stress is one page but five separately-sold indices; the
 *      student/teacher ratio is sold as ordinary and robust; operational staff
 *      is three methods that a tier gets some of. So an entitlement key is
 *      finer than a ModelKey and maps onto one, and a model is reachable when
 *      ANY of its entitlements is held.
 *    * "on demand". Maintenance is sold outright to companies and by request to
 *      academic and public institutions. That request already exists —
 *      org.maintenance_model, granted by /api/maintenance/verify — so on-demand
 *      here means "not by plan", and that flag decides it.
 *
 *  Per-organization exceptions do NOT belong in this file. They live in the
 *  org_entitlements table and are applied over the top by resolveEntitlements
 *  in ./access, so granting one customer something off-plan is a row rather
 *  than a deploy.
 */

import { INSTITUTION_TYPES, type InstitutionType, type PlanType } from './catalog';
import { MODEL_KEYS, type ModelKey } from '../models/catalog';

const ALL: PlanType[] = ['BASIC', 'STANDARD', 'PREMIUM'];
const PREMIUM: PlanType[] = ['PREMIUM'];
const PREMIUM_STANDARD: PlanType[] = ['STANDARD', 'PREMIUM'];
const BASIC_STANDARD: PlanType[] = ['BASIC', 'STANDARD'];
const NONE: PlanType[] = [];

/** Same plans for every institution type, which is most rows. */
function everywhere(plans: PlanType[]): Record<InstitutionType, PlanType[]> {
  return Object.fromEntries(INSTITUTION_TYPES.map((i) => [i, plans])) as Record<
    InstitutionType,
    PlanType[]
  >;
}

export type Entitlement = {
  key: string;
  label: string;
  /** The model page(s) this unlocks. A model opens if any of its entitlements
   *  is held. */
  models: ModelKey[];
  /** Row number in the product plan document, so a cell can be checked against
   *  the source without counting. */
  row: number;
  /** Which plans may use it, per institution type. */
  plans: Record<InstitutionType, PlanType[]>;
  /** Institution types that must request this rather than receiving it with
   *  the plan. Sold, but not by the tier. */
  onDemand?: InstitutionType[];
};

export const ENTITLEMENTS = [
  {
    key: 'student-teacher.ordinary',
    label: 'Student/teacher (K*) ratio — ordinary',
    models: ['student-teacher'],
    row: 1,
    // Only an academic institution has students, so the other two are excluded
    // outright rather than sold at a higher tier.
    plans: { ACADEMIC: ALL, COMPANY: NONE, PUBLIC: NONE },
  },
  {
    key: 'student-teacher.robust',
    label: 'Student/teacher (K*) ratio — robust',
    models: ['student-teacher'],
    row: 2,
    plans: { ACADEMIC: PREMIUM, COMPANY: NONE, PUBLIC: NONE },
  },
  {
    key: 'stress.factor-index',
    label: 'Stress factor index',
    models: ['stress'],
    row: 3,
    plans: everywhere(ALL),
  },
  {
    key: 'stress.all-round',
    label: 'Stress all-round model',
    models: ['stress'],
    row: 4,
    plans: everywhere(ALL),
  },
  {
    key: 'stress.time-pressure',
    label: 'Stress — time-pressure index',
    models: ['stress'],
    row: 5,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'stress.conflict',
    label: 'Stress — conflict index',
    models: ['stress'],
    row: 6,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'stress.feeling-frequency',
    label: 'Stress — feeling frequency value',
    models: ['stress'],
    row: 7,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'appraisal.academic',
    label: 'Academic staff appraisal',
    models: ['appraisal'],
    row: 8,
    plans: everywhere(ALL),
  },
  {
    key: 'appraisal.staff',
    label: 'Staff appraisal',
    models: ['appraisal'],
    row: 9,
    plans: everywhere(ALL),
  },
  {
    key: 'motivation',
    label: 'Staff motivation',
    models: ['motivation'],
    row: 10,
    plans: everywhere(ALL),
  },
  {
    key: 'maintenance',
    label: 'Maintenance model',
    models: ['maintenance'],
    row: 11,
    // Companies buy it with the plan; the other two request it and are granted
    // it through org.maintenance_model.
    plans: { ACADEMIC: NONE, COMPANY: ALL, PUBLIC: NONE },
    onDemand: ['ACADEMIC', 'PUBLIC'],
  },
  {
    key: 'staff-number.plain',
    label: 'Operational staff — plain method',
    models: ['staff-number'],
    row: 12,
    plans: everywhere(BASIC_STANDARD),
  },
  {
    key: 'staff-number.factored',
    label: 'Operational staff — factored method',
    models: ['staff-number'],
    row: 13,
    plans: everywhere(PREMIUM_STANDARD),
  },
  {
    key: 'staff-number.work-sampling',
    label: 'Operational staff — work sampling',
    models: ['staff-number'],
    row: 14,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'personnel-utilization.index',
    label: 'Personnel utilization (H*) index',
    models: ['personnel-utilization'],
    row: 15,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'personnel-utilization.wasted-man-hour',
    label: 'Boss wasted man-hours (D*) from under-loading',
    models: ['personnel-utilization'],
    row: 16,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'personnel-utilization.unit-head-overloading',
    label: 'Unit head overloading',
    models: ['personnel-utilization'],
    row: 17,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'org-structure.management-staff',
    label: 'Number of management staff',
    models: ['org-structure'],
    row: 18,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'org-structure.management-levels',
    label: 'Number of management levels',
    models: ['org-structure'],
    row: 19,
    plans: everywhere(PREMIUM_STANDARD),
  },
  {
    key: 'future-requirements',
    label: 'Prediction of staff number required',
    models: ['future-requirements'],
    row: 20,
    plans: everywhere(PREMIUM_STANDARD),
  },
  {
    key: 'org-structure.size',
    label: 'Size of an organization structure',
    models: ['org-structure'],
    row: 21,
    plans: everywhere(PREMIUM),
  },
  {
    key: 'productivity-index',
    label: 'Productivity index',
    models: ['productivity-index'],
    row: 22,
    plans: everywhere(ALL),
  },
  {
    key: 'redundancy',
    label: 'Redundancy in the organization',
    // The redundancy ratio and the supervision cost that shares its page. The
    // PR% model below is row 24 and sits on its own page.
    models: ['redundancy-index'],
    row: 23,
    plans: everywhere(PREMIUM),
  },
  {
    // The document's row 24 reads "Real percentage Productivity", but the model
    // the product actually ships is Real Percentage Redundancy (PR%) — see the
    // personnel redundancy page and the Supervision Cost tab, both of which
    // name it that way, and the pricing copy that has always listed it under
    // redundancy. Taken as a typo in the document rather than a fifteenth
    // model nobody built.
    key: 'redundancy.real-percentage',
    label: 'Real percentage redundancy (PR%)',
    models: ['personnel-redundancy'],
    row: 24,
    plans: { ACADEMIC: ALL, COMPANY: PREMIUM_STANDARD, PUBLIC: PREMIUM_STANDARD },
  },
  {
    key: 'performance',
    label: 'Achievement criteria performance measurement',
    models: ['performance'],
    row: 25,
    plans: everywhere(ALL),
  },
] as const satisfies readonly Entitlement[];

export type EntitlementKey = (typeof ENTITLEMENTS)[number]['key'];

export const ENTITLEMENT_KEYS = ENTITLEMENTS.map((e) => e.key) as EntitlementKey[];

export function isEntitlementKey(value: unknown): value is EntitlementKey {
  return typeof value === 'string' && (ENTITLEMENT_KEYS as string[]).includes(value);
}

export function entitlementByKey(key: string): Entitlement | undefined {
  return ENTITLEMENTS.find((e) => e.key === key);
}

/** Models the product plan document says nothing about. They are not sold
 *  separately, so a plan cannot withhold them — withholding one would only lock
 *  an organization out of a page it already paid for. Role and model_access
 *  still apply. */
export const UNGOVERNED_MODELS: ModelKey[] = (() => {
  const governed = new Set(ENTITLEMENTS.flatMap((e) => e.models as readonly ModelKey[]));
  return MODEL_KEYS.filter((m) => !governed.has(m));
})();

/** The keys this institution type and tier receive with the plan alone, before
 *  any per-organization override or on-demand grant. */
export function planEntitlements(
  institution: InstitutionType,
  plan: PlanType,
): EntitlementKey[] {
  return ENTITLEMENTS.filter((e) => e.plans[institution].includes(plan)).map((e) => e.key);
}

/** Keys this institution type may request but does not get with the tier. */
export function onDemandEntitlements(institution: InstitutionType): EntitlementKey[] {
  return ENTITLEMENTS.filter((e) =>
    (e as Entitlement).onDemand?.includes(institution),
  ).map((e) => e.key);
}
