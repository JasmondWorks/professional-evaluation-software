import { ORG_ADMIN_ROLES } from '@/app/lib/appraisal/instrument';

/** The staff roster for an organization, as used by every count in the app.
 *
 *  Organization admins are excluded. They evaluate, they do not submit data, so
 *  counting them made a freshly created organization report "0 of 1 staff
 *  submitted" in an Unspecified department that was really just the admin's own
 *  row with no `dept` set. Every roster count must use this so the assessment
 *  page, the dashboard and the stats endpoint cannot drift apart. */
export function rosterWhere(org: string) {
  return {
    org,
    OR: [
      { role: { notIn: [...ORG_ADMIN_ROLES] } },
      { role: null },
    ],
  };
}
