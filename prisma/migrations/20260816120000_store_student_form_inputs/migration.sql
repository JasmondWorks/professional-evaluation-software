-- Keep the student count and basic units so a saved form can be shown back as
-- it was entered. Quantity alone cannot be decomposed into the two.
ALTER TABLE "appraisal_category_score" ADD COLUMN "student_count" INTEGER;
ALTER TABLE "appraisal_category_score" ADD COLUMN "basic_units" DECIMAL(6,2);
