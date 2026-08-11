-- Releasing results is a separate act from closing the period. The client
-- confirmed on 10 Aug 2026 that the organization admin controls when staff see
-- their grade.
ALTER TABLE "appraisal_period" ADD COLUMN "released_at" TIMESTAMP(6);
ALTER TABLE "appraisal_period" ADD COLUMN "released_by" VARCHAR(255);
