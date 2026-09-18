-- WellbeingSession / feeling-vs-stress split. See docs/stress-sessions.md.

-- CreateTable: WellbeingSession
CREATE TABLE "WellbeingSession" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "current_iteration" INTEGER NOT NULL DEFAULT 0,
    "f1_feeling_value" DOUBLE PRECISION,
    "f1_category_limits" JSONB,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ended_reason" VARCHAR(255),
    "created_by" VARCHAR(255),
    CONSTRAINT "WellbeingSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WellbeingSession_org_idx" ON "WellbeingSession"("org");

-- CreateTable: FeelingResult (feeling side of a cycle's outcome)
CREATE TABLE "FeelingResult" (
    "id" SERIAL NOT NULL,
    "cycle_id" INTEGER NOT NULL,
    "session_id" INTEGER,
    "feeling_mean" DOUBLE PRECISION,
    "within_f1_band" BOOLEAN,
    "triggered_reset" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeelingResult_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FeelingResult_cycle_id_idx" ON "FeelingResult"("cycle_id");
CREATE INDEX "FeelingResult_session_id_idx" ON "FeelingResult"("session_id");

-- AlterTable: StressCycle — session linkage + limits provenance
ALTER TABLE "StressCycle"
    ADD COLUMN "session_id" INTEGER,
    ADD COLUMN "iteration" INTEGER,
    ADD COLUMN "limits_source" VARCHAR(30),
    ADD COLUMN "inherited_from_cycle_id" INTEGER;
CREATE INDEX "StressCycle_session_id_idx" ON "StressCycle"("session_id");

-- AlterTable: stress_analysis_results — per-cycle linkage (stress side; soft FK)
ALTER TABLE "stress_analysis_results"
    ADD COLUMN "cycle_id" INTEGER,
    ADD COLUMN "session_id" INTEGER;
CREATE INDEX "stress_analysis_results_cycle_id_idx" ON "stress_analysis_results"("cycle_id");
CREATE INDEX "stress_analysis_results_session_id_idx" ON "stress_analysis_results"("session_id");

-- Foreign keys (Prisma relation defaults)
ALTER TABLE "StressCycle" ADD CONSTRAINT "StressCycle_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "WellbeingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FeelingResult" ADD CONSTRAINT "FeelingResult_cycle_id_fkey"
    FOREIGN KEY ("cycle_id") REFERENCES "StressCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FeelingResult" ADD CONSTRAINT "FeelingResult_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "WellbeingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Backfill: wrap each org's existing cycles into ONE legacy session.
-- Past resets can't be reconstructed, so this is a single "legacy" grouping;
-- new sessions start behaving correctly from the next cycle onward.
-- ---------------------------------------------------------------------------
INSERT INTO "WellbeingSession" ("org", "status", "current_iteration", "started_at", "ended_reason")
SELECT "org", 'active', 0, MIN("created_at"), 'legacy: pre-session cycles'
FROM "StressCycle"
GROUP BY "org";

WITH numbered AS (
    SELECT c."id",
           s."id" AS session_id,
           ROW_NUMBER() OVER (PARTITION BY c."org" ORDER BY c."created_at", c."id") AS rn
    FROM "StressCycle" c
    JOIN "WellbeingSession" s ON s."org" = c."org"
)
UPDATE "StressCycle" c
SET "session_id" = n.session_id,
    "iteration" = n.rn,
    "limits_source" = CASE WHEN c."category_limits" IS NOT NULL THEN 'recomputed' ELSE 'inherited' END
FROM numbered n
WHERE c."id" = n."id";

UPDATE "WellbeingSession" s
SET "current_iteration" = COALESCE(
    (SELECT MAX(c."iteration") FROM "StressCycle" c WHERE c."session_id" = s."id"), 0
);
