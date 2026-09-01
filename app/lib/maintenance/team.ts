// Who runs the maintenance model.
//
// The client, 1 September: "the unit head of the maintenance team is to execute
// it and not the organisation admin ... maintenance activities is usually
// carried out at the production floor and machine monitoring needs close
// proximity to avoid catastrophic incidents". Every other model is the
// organization admin's to execute; this one belongs to the people standing next
// to the machine.
//
// It is deliberately not enforced by hiding the controls from the admin. The
// organization has no unit-head account yet, and an empty allow-list would mean
// nobody could run the model at all, which is a worse failure than an admin
// being able to press a button meant for somebody else. The page says who the
// model belongs to instead, and the allow-list is ready for the day the
// maintenance head exists.

export const MAINTENANCE_TEAM_ROLES = [
  'unit-head',
  'hod',
  'industrial-engineer',
  // Custom roles resolve to the baseline employee surface, and most of this
  // organization's technicians hold one.
  'employee-w',
];

export function isMaintenanceTeam(role?: string | null): boolean {
  return MAINTENANCE_TEAM_ROLES.includes(role ?? '');
}
