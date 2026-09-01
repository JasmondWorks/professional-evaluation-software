-- Saved maintenance computations, and the preventive schedule drawn from them.
--
-- The maintenance sheets computed and forgot: there was no save, so no history
-- and no record of a plan. The client asked for both, and particularly for the
-- arrived dates of the planned maintenance to be kept, since those are what the
-- maintenance head works to.

CREATE TABLE IF NOT EXISTS "maintenance_run" (
  "id"              SERIAL PRIMARY KEY,
  "org"             VARCHAR(255) NOT NULL,
  "facility"        VARCHAR(255) NOT NULL,
  -- Everything typed into the sheets, so a result can be audited to its source.
  "inputs"          JSONB NOT NULL DEFAULT '{}',
  -- Every figure the model produced.
  "results"         JSONB NOT NULL DEFAULT '{}',
  -- The two the plan is built from, kept as columns because the history lists them.
  "optimal_interval" DOUBLE PRECISION,
  "planned_hours"    DOUBLE PRECISION,
  "cycles"           INTEGER,
  "days_between"     INTEGER,
  "starts_on"        DATE,
  -- The dates themselves: one ISO date per planned maintenance.
  "schedule"         JSONB NOT NULL DEFAULT '[]',
  "run_by"           VARCHAR(255),
  "created_at"       TIMESTAMP(6) DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "maintenance_run_org_created_idx"
  ON "maintenance_run" ("org", "created_at" DESC);
