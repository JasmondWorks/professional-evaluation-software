-- Books of Records, Hall of Fame and badges: scope them to an organization,
-- and give the org somewhere to keep the second of its two logos.
--
-- Two separate defects, one migration, because fixing either alone is worse
-- than fixing neither:
--
--   1. These four tables carry no org column, and the routes that read them
--      filter on `category` alone. They are empty today, which is the only
--      reason this has not already leaked — the moment anything is written,
--      every organization on PES sees it in their own book. The write path
--      (app/lib/motivation/records.ts) therefore cannot land before this.
--
--   2. Page 1 of the client's specification puts TWO marks on every award
--      document, the Books of Records and the Hall of Fame record: "the
--      national coat of arm and institutions logo". `org.logo_url` holds the
--      institution's; the coat of arms had nowhere to go.

-- --------------------------------------------------------------------------
-- 1. Organization scope
-- --------------------------------------------------------------------------

-- Nullable, with no backfill: all four tables are empty in both databases, so
-- there is no existing row to attribute and nothing to recover an owner from.
-- Left nullable rather than NOT NULL so this migration cannot fail on a
-- database where that assumption turns out to be wrong — the read routes
-- filter on an exact org_id, so an unattributed row is invisible rather than
-- global, which is the safe direction for a row we cannot place.
--
-- No FK, matching the convention the auditor_responses.org_id migration set:
-- a deleted org would otherwise reject or cascade away the award record, and
-- losing the history is worse than keeping an orphan.
ALTER TABLE "first_book_of_record"  ADD COLUMN IF NOT EXISTS "org_id" UUID;
ALTER TABLE "second_book_of_record" ADD COLUMN IF NOT EXISTS "org_id" UUID;
ALTER TABLE "hall_of_fame"          ADD COLUMN IF NOT EXISTS "org_id" UUID;
ALTER TABLE "badges"                ADD COLUMN IF NOT EXISTS "org_id" UUID;

-- Every read is "this org's records, in this category, newest first", so the
-- index leads with org_id. The bare category/date indexes these tables already
-- carry stay — they are still the right shape for the super-admin's
-- cross-organization view.
CREATE INDEX IF NOT EXISTS "idx_first_book_org"  ON "first_book_of_record"  ("org_id", "category");
CREATE INDEX IF NOT EXISTS "idx_second_book_org" ON "second_book_of_record" ("org_id", "category");
CREATE INDEX IF NOT EXISTS "idx_hall_of_fame_org" ON "hall_of_fame"         ("org_id");
CREATE INDEX IF NOT EXISTS "idx_badges_org"      ON "badges"                ("org_id");

-- --------------------------------------------------------------------------
-- 2. Promotion bookkeeping
-- --------------------------------------------------------------------------

-- Which multi-year window earned the place, e.g. '2024-2026'. Without it the
-- promotion run cannot tell "already promoted for this window" from "eligible
-- again on a later window", and re-running it would duplicate every entry.
ALTER TABLE "first_book_of_record"  ADD COLUMN IF NOT EXISTS "window_label" VARCHAR(50);
ALTER TABLE "second_book_of_record" ADD COLUMN IF NOT EXISTS "window_label" VARCHAR(50);
ALTER TABLE "hall_of_fame"          ADD COLUMN IF NOT EXISTS "window_label" VARCHAR(50);

-- One place per person per window per book. This is what makes the promotion
-- run safe to repeat — it relies on ON CONFLICT DO NOTHING against these.
CREATE UNIQUE INDEX IF NOT EXISTS "uq_first_book_org_name_window"
  ON "first_book_of_record" ("org_id", "name", "window_label");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_second_book_org_name_window"
  ON "second_book_of_record" ("org_id", "name", "window_label");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_hall_of_fame_org_name_window"
  ON "hall_of_fame" ("org_id", "name", "window_label");

-- --------------------------------------------------------------------------
-- 3. The second logo
-- --------------------------------------------------------------------------

-- 255 to match org.logo_url, which the existing uploader already writes.
ALTER TABLE "org" ADD COLUMN IF NOT EXISTS "coat_of_arms_url" VARCHAR(255);
