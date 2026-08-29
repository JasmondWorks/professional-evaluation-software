// Least-squares straight-line fit, and the extrapolation drawn from it.
//
// Every future-requirement prediction in the platform is the same shape: take
// the pairs a model has already recorded, fit y = a + bx through them, read the
// intercept off the y axis and the gradient off the slope, then evaluate the
// line at an x nobody has observed yet. Doing that in one place means the
// student/teacher, staff-number and productivity predictions cannot quietly
// disagree about what "best fit" means.

export type Point = { x: number; y: number };

export type LineFit = {
  /** Where the fitted line meets the y axis — the a-intercept field. */
  a: number;
  /** The slope of the fitted line — the b-gradient field. */
  b: number;
  /** Coefficient of determination. Not used in the arithmetic; it is shown so
   *  the operator can see whether the points justify a straight line at all. */
  r2: number;
  /** The points actually used, after unusable ones were dropped. */
  points: Point[];
};

/** Fit y = a + bx. Returns null when the points cannot determine a line —
 *  fewer than two of them, or every x identical, which is a vertical line with
 *  no gradient rather than a fit worth reporting. */
export function fitLine(input: Point[]): LineFit | null {
  const points = input.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const n = points.length;
  if (n < 2) return null;

  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;

  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    sxx += (p.x - meanX) ** 2;
    sxy += (p.x - meanX) * (p.y - meanY);
  }
  // Every x the same: the points stack in a vertical line, and no finite
  // gradient describes them.
  if (sxx === 0) return null;

  const b = sxy / sxx;
  const a = meanY - b * meanX;

  let ssRes = 0;
  let ssTot = 0;
  for (const p of points) {
    ssRes += (p.y - (a + b * p.x)) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }
  // A flat y series has nothing to explain; call that a perfect fit rather than
  // dividing by zero.
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { a, b, r2, points };
}

/** The fitted line evaluated at x. */
export function predict(fit: Pick<LineFit, 'a' | 'b'>, x: number): number {
  return fit.a + fit.b * x;
}

/** Two points spanning the observed x range, for drawing the fit line across a
 *  scatter plot. */
export function fitEndpoints(fit: LineFit): [Point, Point] {
  const xs = fit.points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  return [
    { x: minX, y: predict(fit, minX) },
    { x: maxX, y: predict(fit, maxX) },
  ];
}
