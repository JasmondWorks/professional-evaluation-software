// The Books of Records and the Hall of Fame: who earns a place, and writing
// them in.
//
// Page 105 of the client's document gives the winning criteria directly, in
// the Performance Classification Scheme's own vocabulary:
//
//     2nd Book of Records          "Very Good"        3-year overall performance
//     1st Book of Records          "Excellent"        3-year overall performance
//     Member of the Hall of Fame   "Very Outstanding" 3-year overall performance
//
// Note what that is NOT. It is not an annual grade, and it is not a single
// period's result — it is the staff member's overall performance taken across
// three years. A member of staff who has one outstanding year inside a weak
// three-year run does not make the Hall of Fame, and the earlier reading of
// these tables as "whatever an admin typed in" had no rule behind it at all.
//
// Until this module existed, nothing in PES ever wrote to these three tables.
// All four viewers read them, so a new organization's Books of Records and
// Hall of Fame were permanently empty with no way to fill them.

import prisma from '@/app/api/prisma.dev';
import { classify } from '@/app/lib/performance/scoring';
import { staffPerformance } from '@/app/lib/performance/results';
import { ORG_ADMIN_ROLES } from '@/app/lib/performance/instrument';

/** How many years of released results make up one window. Page 105's rule is
 *  written against a three-year run throughout. */
export const WINDOW_YEARS = 3;

/** Where a given three-year classification lands the staff member. The
 *  descriptive strings are PERFORMANCE_CLASSES' own, so they cannot drift from
 *  the classification table. */
const DESTINATIONS = {
  'Very Outstanding': {
    table: 'hall_of_fame',
    achievement: 'Member of the Hall of Fame',
  },
  Excellent: {
    table: 'first_book_of_record',
    achievement: '1st Book of Records',
  },
  'Very Good': {
    table: 'second_book_of_record',
    achievement: '2nd Book of Records',
  },
} as const;

type Destination = keyof typeof DESTINATIONS;

function isDestination(descriptive: string): descriptive is Destination {
  return descriptive in DESTINATIONS;
}

export class RecordsError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type Viewer = { orgId: string; role: string; name: string };

function requireOrgAdmin(viewer: Viewer) {
  if (!ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new RecordsError('Only the organization administrator may do this.', 403);
  }
}

/** One staff member's standing across the window. */
export type WindowStanding = {
  name: string;
  dept: string | null;
  /** Mean of their overall across every released period in the window. */
  overall: number;
  /** How many of the window's periods they actually have a result in. */
  periods: number;
  className: string;
  descriptive: string;
  /** Null when the grade earns no place. */
  destination: Destination | null;
};

export type WindowSummary = {
  label: string;
  startsOn: Date;
  endsOn: Date;
  /** Released periods the window is built from. */
  periodCount: number;
  standings: WindowStanding[];
};

/** The three-year window ending with the organization's most recent released
 *  period, and every staff member's standing in it.
 *
 *  Only released periods count. A closed-but-unreleased period is a result the
 *  admin has not yet published to the staff it concerns, and promoting off it
 *  would put someone in the Hall of Fame before they had been told their
 *  grade. Drafts are excluded by `staffPerformance` already. */
export async function windowStandings(orgId: string): Promise<WindowSummary | null> {
  const periods = await prisma.performance_period.findMany({
    where: { org_id: orgId, released_at: { not: null } },
    orderBy: { starts_on: 'desc' },
  });

  if (periods.length === 0) return null;

  // Anchored on the newest released period rather than today, so a window is
  // reproducible: re-running next month against the same data gives the same
  // window and therefore the same promotions.
  const endsOn = periods[0].ends_on;
  const startsOn = new Date(endsOn);
  startsOn.setFullYear(startsOn.getFullYear() - WINDOW_YEARS);

  const inWindow = periods.filter((p) => p.starts_on >= startsOn);
  if (inWindow.length === 0) return null;

  // One accumulator per staff member across every period in the window.
  const totals = new Map<string, { sum: number; count: number; dept: string | null }>();

  for (const period of inWindow) {
    const rows = await staffPerformance({ orgId, periodId: period.id });
    for (const row of rows) {
      if (row.overall === null) continue; // a partial entry has no overall
      const prev = totals.get(row.pesuser_name);
      totals.set(row.pesuser_name, {
        sum: (prev?.sum ?? 0) + row.overall,
        count: (prev?.count ?? 0) + 1,
        dept: row.dept ?? prev?.dept ?? null,
      });
    }
  }

  const standings: WindowStanding[] = [];
  for (const [name, t] of totals) {
    const overall = t.sum / t.count;
    const cls = classify(overall);
    standings.push({
      name,
      dept: t.dept,
      overall: Math.round(overall * 100) / 100,
      periods: t.count,
      className: cls.className,
      descriptive: cls.descriptive,
      destination: isDestination(cls.descriptive) ? cls.descriptive : null,
    });
  }

  standings.sort((a, b) => b.overall - a.overall);

  return {
    label: `${startsOn.getFullYear()}-${endsOn.getFullYear()}`,
    startsOn,
    endsOn,
    periodCount: inWindow.length,
    standings,
  };
}

export type PromotionResult = {
  window: string;
  periodCount: number;
  /** Written this run, per destination. */
  added: Record<Destination, string[]>;
  /** Already present for this window, so left alone. */
  skipped: string[];
  /** Considered but earning no place. */
  ineligible: number;
};

/** Write everyone who qualifies into their book.
 *
 *  Safe to run twice. Each table has a unique index on
 *  (org_id, name, window_label), and a row already there for this window is
 *  counted as skipped rather than duplicated — so an admin who runs the
 *  promotion, releases another period, and runs it again gets only what is
 *  genuinely new. */
export async function promoteForWindow(viewer: Viewer): Promise<PromotionResult> {
  requireOrgAdmin(viewer);

  const summary = await windowStandings(viewer.orgId);
  if (!summary) {
    throw new RecordsError(
      'No released performance results yet, so no records can be awarded.',
      409,
    );
  }

  const added: Record<Destination, string[]> = {
    'Very Outstanding': [],
    Excellent: [],
    'Very Good': [],
  };
  const skipped: string[] = [];
  let ineligible = 0;

  for (const s of summary.standings) {
    if (!s.destination) {
      ineligible += 1;
      continue;
    }

    const dest = DESTINATIONS[s.destination];
    const row = {
      org_id: viewer.orgId,
      name: s.name,
      window_label: summary.label,
      description:
        `${s.descriptive} (${s.className}) over ${summary.label} — ` +
        `${s.overall}% across ${s.periods} released ${s.periods === 1 ? 'period' : 'periods'}` +
        (s.dept ? `, ${s.dept}` : ''),
    };

    try {
      if (dest.table === 'hall_of_fame') {
        await prisma.hall_of_fame.create({
          data: {
            ...row,
            title: dest.achievement,
            year: String(summary.endsOn.getFullYear()),
          },
        });
      } else {
        // Both books share a shape; `category` is what the two viewers of each
        // book filter on, and these are performance-derived records.
        const data = {
          ...row,
          achievement: dest.achievement,
          category: 'performance',
          sub_category: s.dept ?? null,
          date_achieved: summary.endsOn,
        };
        if (dest.table === 'first_book_of_record') {
          await prisma.first_book_of_record.create({ data });
        } else {
          await prisma.second_book_of_record.create({ data });
        }
      }
      added[s.destination].push(s.name);
    } catch (err: any) {
      // P2002 is the unique index doing its job: this person is already in
      // this book for this window.
      if (err?.code === 'P2002') {
        skipped.push(s.name);
        continue;
      }
      throw err;
    }
  }

  return {
    window: summary.label,
    periodCount: summary.periodCount,
    added,
    skipped,
    ineligible,
  };
}
