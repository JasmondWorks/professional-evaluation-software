-- Forms 2 and 4 (course and indicator registries), the non-academic
-- questionnaire, and Dean approval of a department's submissions.

ALTER TABLE "appraisal_entry" ADD COLUMN "questionnaire" JSONB;
ALTER TABLE "appraisal_entry" ADD COLUMN "dean_approved_at" TIMESTAMP(6);
ALTER TABLE "appraisal_entry" ADD COLUMN "dean_approved_by" VARCHAR(255);

CREATE TABLE "appraisal_course" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER NOT NULL,
    "dept" VARCHAR(255),
    "title" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "unit" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appraisal_course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "appraisal_indicator" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "course_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appraisal_indicator_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "appraisal_course_unique" ON "appraisal_course"("org", "period_id", "code");
CREATE INDEX "appraisal_course_org_period_id_idx" ON "appraisal_course"("org", "period_id");
CREATE INDEX "appraisal_indicator_org_period_id_pesuser_name_idx" ON "appraisal_indicator"("org", "period_id", "pesuser_name");

ALTER TABLE "appraisal_course" ADD CONSTRAINT "appraisal_course_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appraisal_indicator" ADD CONSTRAINT "appraisal_indicator_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;
