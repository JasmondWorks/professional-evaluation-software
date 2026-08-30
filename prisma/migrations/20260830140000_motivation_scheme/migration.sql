-- The motivation model as the client's document describes it (pages 102-109).
--
-- Two things have to be kept. Which motivators the head of the establishment
-- adopted, saved against their administration so a change of VC/MD starts a new
-- record rather than overwriting the old one; and every award actually given,
-- since page 109 requires that each year's awards and their receivers be on
-- record.

CREATE TABLE IF NOT EXISTS "motivation_scheme" (
  "id"          SERIAL PRIMARY KEY,
  "org"         VARCHAR(255) NOT NULL,
  -- Whose administration this selection belongs to.
  "tenure"      VARCHAR(255) NOT NULL,
  "selections"  JSONB NOT NULL DEFAULT '[]',
  -- Items the head added by hand, which the document allows for two groups.
  "additions"   JSONB NOT NULL DEFAULT '[]',
  "active"      BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by"  VARCHAR(255),
  "created_at"  TIMESTAMP(6) DEFAULT NOW(),
  "closed_at"   TIMESTAMP(6)
);

CREATE INDEX IF NOT EXISTS "motivation_scheme_org_active_idx"
  ON "motivation_scheme" ("org", "active");

CREATE TABLE IF NOT EXISTS "motivation_award" (
  "id"           SERIAL PRIMARY KEY,
  "org"          VARCHAR(255) NOT NULL,
  "user_id"      INTEGER,
  "staff_name"   VARCHAR(255) NOT NULL,
  "dept"         VARCHAR(255),
  "period"       VARCHAR(20) NOT NULL,
  "period_label" VARCHAR(50) NOT NULL,
  "level"        VARCHAR(30) NOT NULL,
  -- What was given: a motivator key from the catalogue, or a certificate.
  "motivator"    VARCHAR(100) NOT NULL,
  "detail"       TEXT,
  "cash_amount"  NUMERIC(12, 2),
  "awarded_by"   VARCHAR(255),
  "awarded_at"   TIMESTAMP(6) DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "motivation_award_org_period_idx"
  ON "motivation_award" ("org", "period_label");
