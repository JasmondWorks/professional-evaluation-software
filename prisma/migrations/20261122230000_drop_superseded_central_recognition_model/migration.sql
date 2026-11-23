-- Two independent implementations of auditor recognition were built in
-- parallel on separate branches and have just been reconciled in one merge.
-- The one kept (org-admin invites locally; org_auditor tracks the per-org
-- association with 3-year/2-year cooldown tracking; pesuser.globally_recognized
-- + global_recognition_status track platform recognition) matches the client's
-- final, corrected requirements. The one dropped here (platform-admin invites
-- centrally; org_auditor_selection records which org picked which already-
-- recognized auditor) was built against an earlier, since-corrected reading of
-- those requirements — see 20261117120000_auditor_recognition_workflow and
-- 20261031120000_auditor_credentials_and_org, which this undoes the
-- auditor_responses/org_auditor_selection parts of.
--
-- IMPORTANT before running this against any database that actually has rows:
--   - `org_auditor_selection` records real org<->auditor picks if anyone used
--     that flow. If so, migrate the surviving rows into `org_auditor`
--     (status='active', consecutive_years=1) before dropping, rather than
--     running this as-is.
--   - `auditor_responses.recognition_consent` may be the only record of an
--     auditor's global-recognition answer on a database where the new
--     `credential_data`/org_id columns were never backfilled. Check
--     `responses[12]` (GLOBAL_RECOGNITION_QUESTION_INDEX) still has the same
--     answer before dropping the column — it should, since both were written
--     from the same questionnaire submission, but confirm on real data.
--   - `rejection_reason` / `reviewed_at` text is not recoverable after this
--     runs. Export it first if anyone cares about historical rejection
--     reasons from the superseded central-review flow.

DROP TABLE IF EXISTS "org_auditor_selection";

ALTER TABLE "auditor_responses"
  DROP COLUMN IF EXISTS "recognition_consent",
  DROP COLUMN IF EXISTS "credentials",
  DROP COLUMN IF EXISTS "rejection_reason",
  DROP COLUMN IF EXISTS "reviewed_at";
