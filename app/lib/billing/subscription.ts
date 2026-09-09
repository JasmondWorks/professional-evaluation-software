/** Is this organization's subscription still live? SERVER ONLY.
 *
 *  The client, 9 September: the app is bought once from the website, and
 *  everything after that is a yearly subscription. So access is not permanent —
 *  it lapses on a date, and when it does the whole platform closes to that
 *  organization until its administrator renews.
 *
 *  The date lives in subscriptions_info.expires_at, written at signup from
 *  PayPal's own next billing time (or the catalogue interval for a one-time
 *  order), and updated by the PayPal webhook on each renewal.
 *
 *  Read the LATEST row, not the first: a renewal writes a new row, and an
 *  organization that has renewed twice has three, of which only the last one
 *  says anything about today.
 */

import prisma from '@/app/api/prisma.dev';

export type SubscriptionState = {
  /** False only when we are certain it has lapsed. */
  active: boolean;
  expiresAt: Date | null;
  /** Days remaining, negative once lapsed. Null when there is no date at all. */
  daysLeft: number | null;
  /** True when the organization has no subscription row of any kind. */
  unknown: boolean;
};

const DAY = 24 * 60 * 60 * 1000;

/** Organizations created before billing was enforced have no row, and neither
 *  do the client's own test organizations. Locking them out would be a
 *  regression dressed as a feature, so no row means no opinion — `unknown`,
 *  and treated as active. Once real customers exist, every one of them has a
 *  row from the moment they sign up. */
export async function orgSubscription(org: string): Promise<SubscriptionState> {
  const row = await prisma.subscriptions_info.findFirst({
    where: { org },
    orderBy: [{ expires_at: 'desc' }, { id: 'desc' }],
    select: { expires_at: true },
  });

  if (!row?.expires_at) {
    return { active: true, expiresAt: null, daysLeft: null, unknown: true };
  }

  const expiresAt = row.expires_at;
  const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / DAY);

  return {
    active: expiresAt.getTime() > Date.now(),
    expiresAt,
    daysLeft,
    unknown: false,
  };
}

/** The renewal window, for the banner that warns before the lock lands. */
export const RENEWAL_WARNING_DAYS = 14;
