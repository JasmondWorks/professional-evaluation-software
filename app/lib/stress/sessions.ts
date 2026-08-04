// WellbeingSession service — the feeling side of a stress cycle: the ±5% band
// test (the hand-written rule), session iteration tracking, and reset transition.
// See docs/stress-sessions.md. These are pure/service helpers; wire them into the
// evaluation route where the org-level feeling mean is computed.
//
// NOTE ON SEMANTICS: today's reset in /api/saveStressEvaluation keys off the ANOVA
// H0 (stress side). This design instead resets off the FEELING mean vs F1 band.
// Swap `needsReset` there to the result of `recordFeelingAndTransition(...)`.

/** ±5% tolerance band around F1 (the reference feeling from iteration 1). */
export const F1_TOLERANCE = 0.05;

/** Client-confirmed copy shown on the evaluation tab when a reset is called for. */
export const RESET_MESSAGE =
  "Significant difference recorded (H₀ rejected) — call for reset of the settings.";

export type LimitsSource = "recomputed" | "inherited" | "loaded_from_history";

/** Lower/upper bounds of the F1 band: F1 ± 0.05·|F1|. */
export function f1Bounds(f1: number): { lower: number; upper: number } {
  const delta = Math.abs(f1) * F1_TOLERANCE;
  return { lower: f1 - delta, upper: f1 + delta };
}

/**
 * The hand-written rule: F1 − 0.05·F1 < mean < F1 + 0.05·F1.
 * Returns true when the feeling mean is "consistent" (no reset needed).
 */
export function withinF1Band(feelingMean: number, f1: number): boolean {
  const { lower, upper } = f1Bounds(f1);
  return feelingMean > lower && feelingMean < upper;
}

type CycleLimits = {
  id: number;
  session_id: number | null;
  category_limits: unknown;
};

/**
 * Resolve a cycle's effective category limits. With snapshot-on-close,
 * `category_limits` is already set; this walks back within the same session as a
 * fallback for cycles that reused/loaded limits without a snapshot.
 */
export async function resolveEffectiveLimits(
  prisma: any,
  cycle: CycleLimits,
): Promise<unknown | null> {
  if (cycle.category_limits) return cycle.category_limits;
  if (!cycle.session_id) return null;
  const prior = await prisma.stressCycle.findFirst({
    where: {
      session_id: cycle.session_id,
      category_limits: { not: null },
      id: { lte: cycle.id },
    },
    orderBy: { id: "desc" },
  });
  return prior?.category_limits ?? null;
}

/** The org's current active session, if any. */
export async function getActiveSession(prisma: any, org: string) {
  return prisma.wellbeingSession.findFirst({
    where: { org, status: "active" },
    orderBy: { id: "desc" },
  });
}

/** Start a fresh session for the org (current_iteration = 0). */
export async function startSession(prisma: any, org: string, createdBy?: string) {
  return prisma.wellbeingSession.create({
    data: { org, status: "active", current_iteration: 0, created_by: createdBy ?? null },
  });
}

export type TransitionResult = {
  within: boolean;
  triggeredReset: boolean;
  f1: number;
  sessionId: number;
  /** Present only when a reset started a new session. */
  newSessionId?: number;
};

/**
 * Record a cycle's feeling outcome and advance/reset the session.
 *
 * - Iteration 1 (session has no F1 yet): this cycle DEFINES F1; result is in-band.
 * - Later iterations: test the mean against F1 ± 5%.
 *     • in band  → session continues, current_iteration += 1
 *     • out band → session ends (status=reset), a new session starts (i → 0)
 *
 * Always writes a FeelingResult (feeling side); the ANOVA stays separate in
 * stress_analysis_results (stress side).
 */
export async function recordFeelingAndTransition(
  prisma: any,
  params: {
    org: string;
    cycleId: number;
    sessionId?: number | null;
    iteration?: number | null;
    feelingMean: number;
    createdBy?: string;
  },
): Promise<TransitionResult> {
  const { org, cycleId, feelingMean } = params;

  let session =
    (params.sessionId
      ? await prisma.wellbeingSession.findUnique({ where: { id: params.sessionId } })
      : null) ?? (await getActiveSession(prisma, org));
  if (!session) session = await startSession(prisma, org, params.createdBy);
  const sessionId: number = session.id;

  // First iteration defines F1.
  if (session.f1_feeling_value == null) {
    await prisma.wellbeingSession.update({
      where: { id: sessionId },
      data: {
        f1_feeling_value: feelingMean,
        current_iteration: Math.max(session.current_iteration ?? 0, params.iteration ?? 1),
      },
    });
    await prisma.feelingResult.create({
      data: {
        cycle_id: cycleId,
        session_id: sessionId,
        feeling_mean: feelingMean,
        within_f1_band: true,
        triggered_reset: false,
      },
    });
    return { within: true, triggeredReset: false, f1: feelingMean, sessionId };
  }

  const f1: number = session.f1_feeling_value;
  const within = withinF1Band(feelingMean, f1);

  await prisma.feelingResult.create({
    data: {
      cycle_id: cycleId,
      session_id: sessionId,
      feeling_mean: feelingMean,
      within_f1_band: within,
      triggered_reset: !within,
    },
  });

  if (within) {
    await prisma.wellbeingSession.update({
      where: { id: sessionId },
      data: { current_iteration: (session.current_iteration ?? 0) + 1 },
    });
    return { within: true, triggeredReset: false, f1, sessionId };
  }

  // Out of band → reset: end this session, start a fresh one.
  await prisma.wellbeingSession.update({
    where: { id: sessionId },
    data: {
      status: "reset",
      ended_at: new Date(),
      ended_reason: "5% rule: feeling mean outside F1 band",
    },
  });
  const next = await startSession(prisma, org, params.createdBy);
  return { within: false, triggeredReset: true, f1, sessionId, newSessionId: next.id };
}
