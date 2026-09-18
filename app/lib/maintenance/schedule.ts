// Turning a maintenance computation into a plan of dates.
//
// The client's sketch, in his own arithmetic: the optimal maintenance interval
// divided by the planned maintenance hours gives the number of maintenance
// cycles, and the planned hours divided by the twenty-four hours in a day gives
// the days between them. His worked example is 1040 hours over 208, which is
// five cycles, and 208 over 24, which is about nine days. Starting on 1 October
// that puts maintenance on the 1st, 10th, 19th and 28th of October and the 6th
// of November, and stops there. The fifth visit ends the plan; there is no
// sixth on the 15th.

export type MaintenancePlan = {
  cycles: number;
  daysBetween: number;
  /** The raw quotients, so the rounding is visible rather than mysterious. */
  exactCycles: number;
  exactDays: number;
  dates: string[];
};

export function planMaintenance(
  optimalInterval: number,
  plannedHours: number,
  startsOn: string,
): MaintenancePlan | null {
  if (!(optimalInterval > 0) || !(plannedHours > 0)) return null;
  const start = new Date(startsOn);
  if (Number.isNaN(start.getTime())) return null;

  const exactCycles = optimalInterval / plannedHours;
  const exactDays = plannedHours / 24;

  // Both are counts of real things, visits and the days between them, so both
  // are whole numbers. Rounding rather than truncating: his own example rounds
  // 8.67 days up to 9.
  const cycles = Math.max(1, Math.round(exactCycles));
  const daysBetween = Math.max(1, Math.round(exactDays));

  const dates: string[] = [];
  for (let i = 0; i < cycles; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * daysBetween);
    dates.push(d.toISOString().slice(0, 10));
  }

  return { cycles, daysBetween, exactCycles, exactDays, dates };
}
