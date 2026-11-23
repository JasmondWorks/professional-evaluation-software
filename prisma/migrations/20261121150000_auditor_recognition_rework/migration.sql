-- Auditor invitation now flows through the org admin, and the platform admin
-- separately reviews/approves/revokes GLOBAL recognition requests. This adds:
--   * org_id + credential_data on auditor_responses (both were previously
--     read off the submit request and silently dropped before persisting)
--   * global-recognition tracking fields on pesuser
--   * a new org_auditor join table so a globally-recognized auditor can be
--     associated with multiple orgs at once, with per-(org, auditor) 3-year
--     consecutive-service tracking and a 2-year reassignment cooldown

ALTER TABLE "auditor_responses"
  ADD COLUMN "org_id" UUID,
  ADD COLUMN "credential_data" JSONB;

CREATE INDEX "idx_auditor_responses_org_id" ON "auditor_responses"("org_id");

ALTER TABLE "pesuser"
  ADD COLUMN "globally_recognized" BOOLEAN DEFAULT false,
  ADD COLUMN "global_recognition_status" VARCHAR(20),
  ADD COLUMN "global_recognition_requested_at" TIMESTAMP,
  ADD COLUMN "global_recognition_decided_at" TIMESTAMP,
  ADD COLUMN "global_recognition_revoked_at" TIMESTAMP;

CREATE TABLE "org_auditor" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id"            UUID NOT NULL,
  "auditor_id"        UUID NOT NULL REFERENCES "pesuser"("id"),
  "status"            VARCHAR(20) NOT NULL DEFAULT 'active',
  "started_at"        TIMESTAMP NOT NULL DEFAULT now(),
  "ended_at"          TIMESTAMP,
  "consecutive_years" INTEGER NOT NULL DEFAULT 1,
  "last_served_year"  INTEGER,
  "cooldown_until"    DATE,
  "created_at"        TIMESTAMP DEFAULT now(),
  "updated_at"         TIMESTAMP DEFAULT now()
);

CREATE INDEX "idx_org_auditor_org" ON "org_auditor"("org_id");
CREATE INDEX "idx_org_auditor_auditor" ON "org_auditor"("auditor_id");

-- Stops a duplicate ACTIVE row for the same org+auditor pair. Not expressible
-- in Prisma's schema DSL (no partial-index syntax), so it isn't mirrored
-- there, but Postgres enforces it regardless of which client writes.
CREATE UNIQUE INDEX "uq_org_auditor_active_pair"
  ON "org_auditor"("org_id", "auditor_id")
  WHERE "status" = 'active';

-- Backfill: every existing auditor pesuser with an org_id already assigned
-- becomes an active org_auditor row, so they don't silently fall out of all
-- org associations the moment the new join table becomes the source of truth.
INSERT INTO "org_auditor" ("org_id", "auditor_id", "status", "consecutive_years")
SELECT "org_id", "id", 'active', 1
FROM "pesuser"
WHERE "role" = 'auditor' AND "org_id" IS NOT NULL;
