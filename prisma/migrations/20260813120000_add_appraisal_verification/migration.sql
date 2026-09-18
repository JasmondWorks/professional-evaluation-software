-- The departmental administrator verifies Forms 8 and 9 against the paper
-- originals before the HOD reviews. Full document, page 21.
ALTER TABLE "appraisal_entry" ADD COLUMN "verified_at" TIMESTAMP(6);
ALTER TABLE "appraisal_entry" ADD COLUMN "verified_by" VARCHAR(255);
ALTER TABLE "appraisal_entry" ADD COLUMN "verification_note" TEXT;
