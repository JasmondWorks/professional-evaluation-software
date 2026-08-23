-- Performance model: four criteria normalised to 100, the overall as their mean,
-- RTP-graded against a target of 55, with the head's objection, the staff
-- member's response and the auditor's ruling recorded per criterion.
--
-- Replaces the flat userperformance / counter_userperformance pair, which held
-- one overwritten row per staff member with no period, no per-criterion result,
-- no overall and nowhere to put a reason. Those tables are left in place for now
-- so existing screens keep reading; nothing new writes to them.

CREATE TABLE "performance_period" (
  "id"            SERIAL PRIMARY KEY,
  "org"           VARCHAR(255) NOT NULL,
  "frequency"     VARCHAR(20)  NOT NULL,
  "starts_on"     DATE         NOT NULL,
  "ends_on"       DATE         NOT NULL,
  "status"        VARCHAR(20)  NOT NULL DEFAULT 'open',
  "opened_by"     VARCHAR(255),
  "released_at"   TIMESTAMP(6),
  "released_by"   VARCHAR(255),
  "target"        DECIMAL(6,2) NOT NULL DEFAULT 55.00,
  "rater_sample"  INTEGER      NOT NULL DEFAULT 5,
  "rater_minimum" INTEGER      NOT NULL DEFAULT 3,
  "created_at"    TIMESTAMP(6) DEFAULT NOW()
);
CREATE INDEX "performance_period_org_status_idx" ON "performance_period"("org", "status");

CREATE TABLE "performance_entry" (
  "id"           SERIAL PRIMARY KEY,
  "org"          VARCHAR(255) NOT NULL,
  "dept"         VARCHAR(255),
  "period_id"    INTEGER      NOT NULL REFERENCES "performance_period"("id") ON DELETE CASCADE,
  "pesuser_name" VARCHAR(255) NOT NULL,
  "overall"      DECIMAL(6,2),
  "target"       DECIMAL(6,2),
  "rtp"          DECIMAL(10,3),
  "grade"        VARCHAR(20),
  "class_rank"   VARCHAR(20),
  "descriptive"  VARCHAR(30),
  "partial"      BOOLEAN      NOT NULL DEFAULT FALSE,
  "status"       VARCHAR(30)  NOT NULL DEFAULT 'draft',
  "flagged"      BOOLEAN      NOT NULL DEFAULT FALSE,
  "submitted_at" TIMESTAMP(6),
  "evaluated_at" TIMESTAMP(6),
  "created_at"   TIMESTAMP(6) DEFAULT NOW(),
  "updated_at"   TIMESTAMP(6) DEFAULT NOW()
);
CREATE UNIQUE INDEX "performance_entry_unique" ON "performance_entry"("period_id", "pesuser_name");
CREATE INDEX "performance_entry_org_status_idx" ON "performance_entry"("org", "status");
CREATE INDEX "performance_entry_org_flagged_idx" ON "performance_entry"("org", "flagged");

CREATE TABLE "performance_criterion_score" (
  "id"                SERIAL PRIMARY KEY,
  "entry_id"          INTEGER     NOT NULL REFERENCES "performance_entry"("id") ON DELETE CASCADE,
  "criterion"         VARCHAR(40) NOT NULL,
  "ratings"           JSONB,
  "staff_score"       DECIMAL(6,2),
  "hod_score"         DECIMAL(6,2),
  "hod_justification" TEXT,
  "staff_accepted"    BOOLEAN,
  "reconciliation"    VARCHAR(40),
  "recorded_score"    DECIMAL(6,2),
  "auditor_score"     DECIMAL(6,2),
  "auditor_note"      TEXT
);
CREATE UNIQUE INDEX "performance_criterion_unique" ON "performance_criterion_score"("entry_id", "criterion");

-- The staff drawn at random to score their head, and their returns.
CREATE TABLE "hod_performance_rater" (
  "id"                   SERIAL PRIMARY KEY,
  "org"                  VARCHAR(255) NOT NULL,
  "period_id"            INTEGER      NOT NULL REFERENCES "performance_period"("id") ON DELETE CASCADE,
  "dept"                 VARCHAR(255) NOT NULL,
  "hod_name"             VARCHAR(255) NOT NULL,
  "rater_name"           VARCHAR(255) NOT NULL,
  "management_ratings"   JSONB,
  "productivity_ratings" JSONB,
  "management"           DECIMAL(6,2),
  "productivity"         DECIMAL(6,2),
  "submitted_at"         TIMESTAMP(6),
  "created_at"           TIMESTAMP(6) DEFAULT NOW()
);
CREATE UNIQUE INDEX "hod_performance_rater_unique" ON "hod_performance_rater"("period_id", "hod_name", "rater_name");
CREATE INDEX "hod_performance_rater_hod_idx" ON "hod_performance_rater"("org", "period_id", "hod_name");
CREATE INDEX "hod_performance_rater_rater_idx" ON "hod_performance_rater"("rater_name");

CREATE TABLE "hod_performance_result" (
  "id"            SERIAL PRIMARY KEY,
  "org"           VARCHAR(255) NOT NULL,
  "period_id"     INTEGER      NOT NULL REFERENCES "performance_period"("id") ON DELETE CASCADE,
  "dept"          VARCHAR(255) NOT NULL,
  "hod_name"      VARCHAR(255) NOT NULL,
  "management"    DECIMAL(6,2),
  "productivity"  DECIMAL(6,2),
  "overall"       DECIMAL(6,2),
  "target"        DECIMAL(6,2),
  "rtp"           DECIMAL(10,3),
  "grade"         VARCHAR(20),
  "class_rank"    VARCHAR(20),
  "descriptive"   VARCHAR(30),
  "raters"        INTEGER      NOT NULL DEFAULT 0,
  "below_minimum" BOOLEAN      NOT NULL DEFAULT FALSE,
  "evaluated_at"  TIMESTAMP(6),
  "created_at"    TIMESTAMP(6) DEFAULT NOW()
);
CREATE UNIQUE INDEX "hod_performance_result_unique" ON "hod_performance_result"("period_id", "hod_name");
CREATE INDEX "hod_performance_result_org_idx" ON "hod_performance_result"("org", "period_id");
