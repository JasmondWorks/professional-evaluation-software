// The utilization model's boundary conditions, in one place.
//
// Equations 39, 40, 41 and 42 decide whether an optimal K is feasible at all.
// They used to live inside the personnel utilization page, which meant they
// were checked once, for the supervisory level, and nowhere else. The client's
// instruction of 30 August is that the full parameter set is entered once at
// level 1 and held constant up the hierarchy, each level varying only its own
// rates — which is exactly what makes it possible to test every level against
// the same conditions. So they live here, and both callers use them.

export type ConstraintParams = {
  alpha?: number | null;
  Y?: number | null;
  W?: number | null;
  D?: number | null;
  G?: number | null;
  J?: number | null;
  t1?: number | null;
  t2?: number | null;
  t3?: number | null;
  t4?: number | null;
};

const num = (v: number | null | undefined, fallback: number): number =>
  v == null || !Number.isFinite(Number(v)) ? fallback : Number(v);

/** Every condition the given K breaks, in the document's own wording. An empty
 *  array means the span is feasible. λ and μ are passed separately because Eq.
 *  41 is about the rates of the level being tested, not the inherited set. */
export function boundaryViolations(
  params: ConstraintParams,
  K: number,
  lambda: number,
  mu: number,
): string[] {
  const fails: string[] = [];

  const t3 = num(params.t3, 1);
  const t4 = num(params.t4, 0);
  const D = num(params.D, 0);
  const Y = params.Y == null ? undefined : Number(params.Y);
  const alpha = params.alpha == null ? undefined : Number(params.alpha);
  const W = params.W == null ? undefined : Number(params.W);
  const G = params.G == null ? undefined : Number(params.G);
  const J = params.J == null ? undefined : Number(params.J);

  const rhs = Y !== undefined && alpha !== undefined ? t3 * (D - Y * alpha) : t3 * D;

  if (!(t4 * K <= rhs)) fails.push('Eq.39 fails: t4·K > t3·(D − Yα)');
  if (W !== undefined && !(W <= rhs)) fails.push('Eq.40 fails: W > t3·(D − Yα)');
  if (!(lambda < mu)) fails.push('Eq.41 fails: λ must be strictly less than μ');
  if (J !== undefined && G !== undefined && !(J <= G - D)) {
    fails.push('Eq.42 fails: J > (G − D)');
  }

  return fails;
}

/** True when the stored run carries enough of the parameter set to be worth
 *  testing against. A run saved before these columns existed carries none of
 *  them, and inventing zeros would fail Eq. 39 for every level. */
export function hasConstraintParams(params: ConstraintParams | null): boolean {
  if (!params) return false;
  return [params.D, params.W, params.t3, params.t4, params.alpha, params.Y].some(
    (v) => v != null && Number.isFinite(Number(v)),
  );
}
