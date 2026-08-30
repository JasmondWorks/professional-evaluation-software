-- The boundary conditions (Eq. 39, 40, 42) need more than the three rates a run
-- has been storing. The client's instruction of 30 August is that the full
-- utilization form is filled once, at level 1, and every management level above
-- it holds those variables constant while supplying only its own rates. That
-- only works if the level-1 run remembers them, so it does now.

ALTER TABLE "personnel_utilization"
  ADD COLUMN IF NOT EXISTS "alpha" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "y_coef" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "w_val" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "d_val" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "g_val" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "j_val" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "t1" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "t2" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "t3" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "t4" DOUBLE PRECISION;
