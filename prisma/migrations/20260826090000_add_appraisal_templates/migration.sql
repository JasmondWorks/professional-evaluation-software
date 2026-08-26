-- Appraisal target templates.
--
-- The shipped target values become a locked system template per scheme, and an
-- organization may define its own. Hand-written because `prisma migrate dev`
-- cannot replay this repo's history (see CLAUDE.md); apply with `db execute`
-- then `migrate resolve --applied`.

CREATE TABLE "appraisal_template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" VARCHAR(20) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "org" VARCHAR(255),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "source_template_id" UUID,
    "created_by" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ready_at" TIMESTAMP(6),
    "ready_by" VARCHAR(255),
    "approved_at" TIMESTAMP(6),
    "approved_by" VARCHAR(255),
    CONSTRAINT "appraisal_template_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "appraisal_template_org_scope_status_idx" ON "appraisal_template"("org", "scope", "status");
CREATE INDEX "appraisal_template_is_system_scope_idx" ON "appraisal_template"("is_system", "scope");

CREATE TABLE "appraisal_template_target" (
    "id" SERIAL NOT NULL,
    "template_id" UUID NOT NULL,
    "position" VARCHAR(60),
    "post" VARCHAR(60),
    "cadre" VARCHAR(60),
    "category" VARCHAR(40),
    "target" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "appraisal_template_target_pkey" PRIMARY KEY ("id")
);

-- NULLS NOT DISTINCT so two rows keying on the same position with a null post
-- collide, matching how appraisal_target is keyed.
CREATE UNIQUE INDEX "appraisal_template_target_unique"
    ON "appraisal_template_target"("template_id", "position", "post", "cadre", "category")
    NULLS NOT DISTINCT;

ALTER TABLE "appraisal_template_target"
    ADD CONSTRAINT "appraisal_template_target_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "appraisal_template"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "org_template_choice" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "scope" VARCHAR(20) NOT NULL,
    "template_id" UUID NOT NULL,
    "chosen_by" VARCHAR(255),
    "chosen_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "org_template_choice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "org_template_choice_unique" ON "org_template_choice"("org", "scope");

ALTER TABLE "org_template_choice"
    ADD CONSTRAINT "org_template_choice_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "appraisal_template"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- A period records the templates it was scored against, so closing it freezes
-- the numbers even if the organization later changes its choice.
ALTER TABLE "appraisal_period" ADD COLUMN "academic_template_id" UUID;
ALTER TABLE "appraisal_period" ADD COLUMN "non_academic_template_id" UUID;

ALTER TABLE "appraisal_period"
    ADD CONSTRAINT "appraisal_period_academic_template_id_fkey"
    FOREIGN KEY ("academic_template_id") REFERENCES "appraisal_template"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appraisal_period"
    ADD CONSTRAINT "appraisal_period_non_academic_template_id_fkey"
    FOREIGN KEY ("non_academic_template_id") REFERENCES "appraisal_template"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
