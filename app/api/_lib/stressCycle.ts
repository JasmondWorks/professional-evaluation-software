// Time-based phase advancement for a stress cycle. There's no scheduler, so we
// advance lazily: whenever a cycle is read, if a window's close date has passed
// we treat (and persist) the phase as closed. Keeps the forms and the admin
// status honest without a cron job.

type CycleLike = {
  phase: string;
  settings_closes_at: Date | null;
  feeling_closes_at: Date | null;
};

// The phase the cycle should be in right now, given the window close dates.
export function effectivePhase(c: CycleLike): string {
  const now = Date.now();
  if (
    c.phase === 'settings_open' &&
    c.settings_closes_at &&
    now > c.settings_closes_at.getTime()
  ) {
    return 'settings_closed';
  }
  if (
    c.phase === 'feeling_open' &&
    c.feeling_closes_at &&
    now > c.feeling_closes_at.getTime()
  ) {
    return 'feeling_closed';
  }
  return c.phase;
}

// Persist the advanced phase if it changed; returns the effective phase.
export async function syncCyclePhase(
  prisma: any,
  cycle: { id: number } & CycleLike,
): Promise<string> {
  const eff = effectivePhase(cycle);
  if (eff !== cycle.phase) {
    await prisma.stressCycle.update({ where: { id: cycle.id }, data: { phase: eff } });
  }
  return eff;
}
