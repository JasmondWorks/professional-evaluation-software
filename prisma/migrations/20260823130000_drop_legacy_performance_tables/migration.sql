-- Drop the flat performance tables the performance model replaces.
--
-- `userperformance` held one overwritten row per staff member: no period, no
-- per-criterion normalisation, no overall, no grade, and nowhere to record the
-- head's reason or the auditor's ruling. `counter_userperformance` was the
-- head's side of the same, written with no justification at all.
--
-- Nothing reads either table any more — every consumer now goes through
-- app/lib/performance/results.ts. The rows they held were 1-5 demo seed values
-- on no defined scale, so there is nothing to migrate forward; carrying them
-- over would publish meaningless figures as real results.
DROP TABLE IF EXISTS "counter_userperformance";
DROP TABLE IF EXISTS "userperformance";
