-- The client's two data requests of 30 August 2026.
--
-- 1. The future staff-number prediction must pair a K* with the staff number it
--    was run against, and read that pairing out of the personnel utilization
--    history. Those runs recorded only the queueing figures, so the staff
--    numbers are stored beside them from now on.
--
-- 2. Section 21 compares the ideal management head count at each level against
--    what the organization really employs there. That count is to come from the
--    employee records, which need to say which management level a person sits
--    at. NULL means "not a management post", which is the correct default for
--    every row that exists today.

ALTER TABLE "personnel_utilization"
  ADD COLUMN IF NOT EXISTS "staff_number"      DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "supervisory_staff" INTEGER,
  ADD COLUMN IF NOT EXISTS "management_staff"  INTEGER,
  ADD COLUMN IF NOT EXISTS "staff_method"      VARCHAR(50);

ALTER TABLE "pesuser"
  ADD COLUMN IF NOT EXISTS "management_level" INTEGER;

CREATE INDEX IF NOT EXISTS "pesuser_org_management_level_idx"
  ON "pesuser" ("org", "management_level");
