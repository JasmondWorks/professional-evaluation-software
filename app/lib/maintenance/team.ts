// Who runs the maintenance model.
//
// The client, 1 September: "the unit head of the maintenance team is to execute
// it and not the organisation admin ... maintenance activities is usually
// carried out at the production floor and machine monitoring needs close
// proximity to avoid catastrophic incidents". Every other model is the
// organization admin's to execute; this one belongs to the people standing next
// to the machine.
//
// Expressed as "everyone except the admin" rather than as a list of allowed
// roles, deliberately. Most technicians in a real organization hold a custom
// role, which resolves to the baseline employee surface, and an allow-list of
// preset names would keep locking out exactly the people the rule is meant to
// empower. The rule is about who may NOT run it, so that is what is written.

const ADMIN_ROLES = ['admin', 'super-admin'];

/** The maintenance head proper. An organization with none of these has nobody
 *  formally accountable for the schedule, which is worth saying out loud. */
export const MAINTENANCE_HEAD_ROLE = 'unit-head';

export function isOrgAdmin(role?: string | null): boolean {
  return ADMIN_ROLES.includes(role ?? '');
}

/** May this person conduct a run and save its plan? */
export function mayRunMaintenance(role?: string | null): boolean {
  if (!role) return false;
  return !isOrgAdmin(role);
}
