-- External auditor submissions: persist the uploaded credentials, the
-- recognition consent, and the inviting organization.
--
-- All three were already being produced upstream and then dropped on the
-- floor: the accept form uploaded credential files and POSTed their URLs, the
-- invite token carried the inviting org, and the questionnaire asked for
-- recognition consent — but the submit route destructured none of them and
-- this table had nowhere to put them.

-- Slot key -> uploaded file URL, e.g.
--   {"c_origin": "https://...", "c_prof": "https://...", "c_acad": "https://..."}
-- Keys are the four slots in app/lib/auditor/questions.ts (CREDENTIAL_SLOTS).
-- JSONB rather than four columns because "Others" is explicitly open-ended
-- ("As deemed necessary" on the form) and more slots are expected.
ALTER TABLE "auditor_responses"
  ADD COLUMN IF NOT EXISTS "credentials" JSONB;

-- Denormalized from responses[12] ("Do you want your role to be recognized
-- globally by this app?"). Kept as a named column because it gates who may
-- view the credentials above, and a positional index into an untyped JSON
-- array is not something an authorization check should depend on.
-- NOT NULL DEFAULT false: absent consent must read as withheld, never as NULL
-- flowing into a permission test.
ALTER TABLE "auditor_responses"
  ADD COLUMN IF NOT EXISTS "recognition_consent" BOOLEAN NOT NULL DEFAULT false;

-- The organization whose admin issued the invite. Nullable because every row
-- written before this migration has no org recorded anywhere to recover it
-- from. No FK: `organizations` ids are not consistently referenced elsewhere
-- in this schema, and a hard constraint here would reject a submission whose
-- org was since deleted — losing the audit record rather than preserving it.
ALTER TABLE "auditor_responses"
  ADD COLUMN IF NOT EXISTS "org_id" UUID;

-- The super-admin screens list by org and filter to consenting auditors.
CREATE INDEX IF NOT EXISTS "idx_auditor_responses_org_id"
  ON "auditor_responses" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_auditor_responses_recognition_consent"
  ON "auditor_responses" ("recognition_consent");

-- Backfill consent for rows already submitted. Their answers are in the JSON
-- array, so the flag is recoverable even though the credentials are not.
UPDATE "auditor_responses"
SET "recognition_consent" = true
WHERE lower(trim(both from ("responses" ->> 12))) = 'yes';
