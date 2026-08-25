-- Align the performance tables with the schema they already declare.
-- Both databases enforced ON DELETE RESTRICT while schema.prisma declares
-- Cascade, so deleting a performance_period failed with an FK violation.
-- The index renames are cosmetic catch-up from the same drift.

-- DropForeignKey
ALTER TABLE "hod_performance_rater" DROP CONSTRAINT "hod_performance_rater_period_id_fkey";

-- DropForeignKey
ALTER TABLE "hod_performance_result" DROP CONSTRAINT "hod_performance_result_period_id_fkey";

-- DropForeignKey
ALTER TABLE "performance_criterion_score" DROP CONSTRAINT "performance_criterion_score_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "performance_entry" DROP CONSTRAINT "performance_entry_period_id_fkey";

-- AddForeignKey
ALTER TABLE "performance_entry" ADD CONSTRAINT "performance_entry_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "performance_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_criterion_score" ADD CONSTRAINT "performance_criterion_score_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "performance_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hod_performance_rater" ADD CONSTRAINT "hod_performance_rater_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "performance_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hod_performance_result" ADD CONSTRAINT "hod_performance_result_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "performance_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "hod_performance_rater_hod_idx" RENAME TO "hod_performance_rater_org_period_id_hod_name_idx";

-- RenameIndex
ALTER INDEX "hod_performance_rater_rater_idx" RENAME TO "hod_performance_rater_rater_name_idx";

-- RenameIndex
ALTER INDEX "hod_performance_result_org_idx" RENAME TO "hod_performance_result_org_period_id_idx";

