-- A maintenance run belongs to a machine, not to a name.
--
-- The client, 2 September: the model is run against a registered machine, so
-- the result should be saved against that machine, with the date, and the MTBF
-- kept with it. The run recorded the facility's description as free text, which
-- breaks the moment a facility is renamed and cannot be joined back to the
-- register at all.

ALTER TABLE "maintenance_run"
  ADD COLUMN IF NOT EXISTS "facility_id"     INTEGER,
  ADD COLUMN IF NOT EXISTS "facility_symbol" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "mtbf"            DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS "maintenance_run_facility_idx"
  ON "maintenance_run" ("org", "facility_id");
