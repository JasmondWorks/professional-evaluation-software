-- Platform-admin review of auditor recognition: reject reason + review timestamp,
-- and a join table recording which org selected which recognized auditor and when.

ALTER TABLE "auditor_responses"
  ADD COLUMN "rejection_reason" TEXT,
  ADD COLUMN "reviewed_at" TIMESTAMP(6);

CREATE TABLE "org_auditor_selection" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "org_id" UUID NOT NULL,
  "auditor_id" UUID NOT NULL,
  "selected_by" UUID NOT NULL,
  "selected_at" TIMESTAMP(6) NOT NULL DEFAULT now(),

  CONSTRAINT "org_auditor_selection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "org_auditor_selection_unique" ON "org_auditor_selection"("org_id", "auditor_id");
CREATE INDEX "idx_org_auditor_selection_auditor_id" ON "org_auditor_selection"("auditor_id");
