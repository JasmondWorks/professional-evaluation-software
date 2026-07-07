-- Migration: Fix personnel_utilization schema to match Charles-Owaba Ch.8 textbook formula
-- This ONLY affects the personnel_utilization table.
-- All other tables remain untouched.

-- Step 1: Drop old data (computed with the wrong formula)
TRUNCATE TABLE personnel_utilization;

-- Step 2: Drop columns that don't exist in the textbook
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS b;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS w;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS t1;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS t2;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS t3;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS t4;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS s0;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS g;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS d;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS y;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS alpha;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS j;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS constraints_ok;
ALTER TABLE personnel_utilization DROP COLUMN IF EXISTS violations;

-- Step 3: Adjust precision on existing columns
ALTER TABLE personnel_utilization ALTER COLUMN lambda TYPE DECIMAL(10,6);
ALTER TABLE personnel_utilization ALTER COLUMN mu TYPE DECIMAL(10,6);
ALTER TABLE personnel_utilization ALTER COLUMN p0 TYPE DECIMAL(10,6);

-- Step 4: Add new correct columns
ALTER TABLE personnel_utilization ADD COLUMN IF NOT EXISTS a_ij DECIMAL(10,4);
ALTER TABLE personnel_utilization ADD COLUMN IF NOT EXISTS rho DECIMAL(10,6);
ALTER TABLE personnel_utilization ADD COLUMN IF NOT EXISTS lbar DECIMAL(10,6);
