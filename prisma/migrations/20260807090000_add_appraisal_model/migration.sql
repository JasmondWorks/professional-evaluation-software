-- Appraisal model (academic and non-academic).
-- Adds the period, target, entry, category-score and evidence tables that
-- app/lib/appraisal/ scores over. Additive only: no existing table is touched.

-- CreateTable
CREATE TABLE "appraisal_period" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "frequency" VARCHAR(20) NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "opened_by" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_target" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER,
    "model" VARCHAR(20) NOT NULL,
    "position" VARCHAR(60),
    "post" VARCHAR(60),
    "cadre" VARCHAR(60),
    "category" VARCHAR(40),
    "target" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "appraisal_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_entry" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "dept" VARCHAR(255),
    "period_id" INTEGER NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "model" VARCHAR(20) NOT NULL,
    "position" VARCHAR(60),
    "post" VARCHAR(60),
    "cadre" VARCHAR(60),
    "total_observed" DECIMAL(12,3),
    "total_target" DECIMAL(12,3),
    "rtp" DECIMAL(10,3),
    "grade" VARCHAR(20),
    "partial_target" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(6),
    "approved_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_category_score" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "line_items" JSONB,
    "quality" DECIMAL(6,2),
    "quantity" DECIMAL(12,4),
    "worth" INTEGER,
    "observed" DECIMAL(12,3),
    "target" DECIMAL(10,2),
    "appraisal_score" DECIMAL(6,2),
    "hod_score" DECIMAL(6,2),
    "hod_justification" TEXT,
    "staff_accepted" BOOLEAN,
    "reconciliation" VARCHAR(40),
    "recorded_score" DECIMAL(6,2),
    "auditor_score" DECIMAL(6,2),
    "auditor_note" TEXT,
    "copies_submitted" INTEGER,

    CONSTRAINT "appraisal_category_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_evidence" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "rule_key" VARCHAR(60) NOT NULL,
    "label" VARCHAR(255),
    "measure" DECIMAL(12,3) NOT NULL,
    "scripts" INTEGER,
    "evidence_url" VARCHAR(500),
    "units" DECIMAL(12,4),

    CONSTRAINT "appraisal_evidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "appraisal_period_org_status_idx" ON "appraisal_period"("org", "status");
CREATE INDEX "appraisal_target_org_model_idx" ON "appraisal_target"("org", "model");
CREATE UNIQUE INDEX "appraisal_target_unique" ON "appraisal_target"("org", "period_id", "model", "position", "post", "cadre", "category");
CREATE INDEX "appraisal_entry_org_status_idx" ON "appraisal_entry"("org", "status");
CREATE INDEX "appraisal_entry_org_flagged_idx" ON "appraisal_entry"("org", "flagged");
CREATE UNIQUE INDEX "appraisal_entry_unique" ON "appraisal_entry"("period_id", "pesuser_name");
CREATE UNIQUE INDEX "appraisal_category_unique" ON "appraisal_category_score"("entry_id", "category");
CREATE INDEX "appraisal_evidence_entry_id_category_idx" ON "appraisal_evidence"("entry_id", "category");

ALTER TABLE "appraisal_target" ADD CONSTRAINT "appraisal_target_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appraisal_entry" ADD CONSTRAINT "appraisal_entry_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appraisal_category_score" ADD CONSTRAINT "appraisal_category_score_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "appraisal_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appraisal_evidence" ADD CONSTRAINT "appraisal_evidence_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "appraisal_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
