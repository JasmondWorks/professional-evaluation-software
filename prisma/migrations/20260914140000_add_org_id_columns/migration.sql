-- Phase 1 of the org-name-to-org-id tenant-key migration (additive, non-breaking).
-- Adds org_id to every org-bearing table, FK to org.id, an index, and backfills
-- by matching the existing org name string against org.name (safe: org.name was
-- @unique until this same migration series, so no ambiguous historical matches
-- exist). The old org string columns are dropped in a later migration once the
-- application code has fully switched to org_id.

-- Organization logo, moved off pesuser.image (which held the admin picture,
-- wrongly reused for the org logo at provisioning) onto the organization itself.
ALTER TABLE "org" ADD COLUMN "logo_url" VARCHAR(255);

-- Phase 1 (additive, safe): add org_id to every org-bearing table, FK to org.id, plain index, backfill by name.
-- staff_motivation.org is already an orphaned Int with no FK and zero rows in both DBs (verified) --
-- it gets org_id added the same way as everything else; its old int column is dropped in phase 2 like the rest.

ALTER TABLE "OptimizationResult" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "OptimizationResult" ADD CONSTRAINT "OptimizationResult_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "OptimizationResult_org_id_idx" ON "OptimizationResult"("org_id");
UPDATE "OptimizationResult" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "StressCycle" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "StressCycle" ADD CONSTRAINT "StressCycle_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "StressCycle_org_id_idx" ON "StressCycle"("org_id");
UPDATE "StressCycle" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "WellbeingSession" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "WellbeingSession" ADD CONSTRAINT "WellbeingSession_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "WellbeingSession_org_id_idx" ON "WellbeingSession"("org_id");
UPDATE "WellbeingSession" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "StaffEstimation" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "StaffEstimation" ADD CONSTRAINT "StaffEstimation_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "StaffEstimation_org_id_idx" ON "StaffEstimation"("org_id");
UPDATE "StaffEstimation" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "appraisal" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "appraisal" ADD CONSTRAINT "appraisal_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "appraisal_org_id_idx" ON "appraisal"("org_id");
UPDATE "appraisal" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "auditor_survey_responses" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "auditor_survey_responses" ADD CONSTRAINT "auditor_survey_responses_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "auditor_survey_responses_org_id_idx" ON "auditor_survey_responses"("org_id");
UPDATE "auditor_survey_responses" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "counter_appraisal" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "counter_appraisal" ADD CONSTRAINT "counter_appraisal_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "counter_appraisal_org_id_idx" ON "counter_appraisal"("org_id");
UPDATE "counter_appraisal" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "counter_stress" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "counter_stress" ADD CONSTRAINT "counter_stress_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "counter_stress_org_id_idx" ON "counter_stress"("org_id");
UPDATE "counter_stress" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "facilities" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "facilities_org_id_idx" ON "facilities"("org_id");
UPDATE "facilities" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "index" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "index" ADD CONSTRAINT "index_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "index_org_id_idx" ON "index"("org_id");
UPDATE "index" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "motivation" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "motivation" ADD CONSTRAINT "motivation_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "motivation_org_id_idx" ON "motivation"("org_id");
UPDATE "motivation" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "maintenance_run" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "maintenance_run" ADD CONSTRAINT "maintenance_run_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "maintenance_run_org_id_idx" ON "maintenance_run"("org_id");
UPDATE "maintenance_run" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "motivation_scheme" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "motivation_scheme" ADD CONSTRAINT "motivation_scheme_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "motivation_scheme_org_id_idx" ON "motivation_scheme"("org_id");
UPDATE "motivation_scheme" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "motivation_award" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "motivation_award" ADD CONSTRAINT "motivation_award_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "motivation_award_org_id_idx" ON "motivation_award"("org_id");
UPDATE "motivation_award" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "non_academic_appraisal" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "non_academic_appraisal" ADD CONSTRAINT "non_academic_appraisal_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "non_academic_appraisal_org_id_idx" ON "non_academic_appraisal"("org_id");
UPDATE "non_academic_appraisal" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "notifications" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "notifications_org_id_idx" ON "notifications"("org_id");
UPDATE "notifications" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "org_structure_results" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "org_structure_results" ADD CONSTRAINT "org_structure_results_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "org_structure_results_org_id_idx" ON "org_structure_results"("org_id");
UPDATE "org_structure_results" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "performance_result" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "performance_result" ADD CONSTRAINT "performance_result_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "performance_result_org_id_idx" ON "performance_result"("org_id");
UPDATE "performance_result" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "permission" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "permission" ADD CONSTRAINT "permission_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "permission_org_id_idx" ON "permission"("org_id");
UPDATE "permission" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "personnel_redundancy" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "personnel_redundancy" ADD CONSTRAINT "personnel_redundancy_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "personnel_redundancy_org_id_idx" ON "personnel_redundancy"("org_id");
UPDATE "personnel_redundancy" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "personnel_utilization" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "personnel_utilization" ADD CONSTRAINT "personnel_utilization_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "personnel_utilization_org_id_idx" ON "personnel_utilization"("org_id");
UPDATE "personnel_utilization" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "supervision_cost" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "supervision_cost" ADD CONSTRAINT "supervision_cost_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "supervision_cost_org_id_idx" ON "supervision_cost"("org_id");
UPDATE "supervision_cost" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "pesuser" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "pesuser" ADD CONSTRAINT "pesuser_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "pesuser_org_id_idx" ON "pesuser"("org_id");
UPDATE "pesuser" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "roles" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "roles" ADD CONSTRAINT "roles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "roles_org_id_idx" ON "roles"("org_id");
UPDATE "roles" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "staff_appraisal_results" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "staff_appraisal_results" ADD CONSTRAINT "staff_appraisal_results_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "staff_appraisal_results_org_id_idx" ON "staff_appraisal_results"("org_id");
UPDATE "staff_appraisal_results" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "staff_motivation" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "staff_motivation" ADD CONSTRAINT "staff_motivation_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "staff_motivation_org_id_idx" ON "staff_motivation"("org_id");

ALTER TABLE "staff_survey_responses" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "staff_survey_responses" ADD CONSTRAINT "staff_survey_responses_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "staff_survey_responses_org_id_idx" ON "staff_survey_responses"("org_id");
UPDATE "staff_survey_responses" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "stress" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "stress" ADD CONSTRAINT "stress_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "stress_org_id_idx" ON "stress"("org_id");
UPDATE "stress" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "stress_analysis_results" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "stress_analysis_results" ADD CONSTRAINT "stress_analysis_results_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "stress_analysis_results_org_id_idx" ON "stress_analysis_results"("org_id");
UPDATE "stress_analysis_results" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "stress_scores" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "stress_scores" ADD CONSTRAINT "stress_scores_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "stress_scores_org_id_idx" ON "stress_scores"("org_id");
UPDATE "stress_scores" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "subscriptions_info" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "subscriptions_info" ADD CONSTRAINT "subscriptions_info_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "subscriptions_info_org_id_idx" ON "subscriptions_info"("org_id");
UPDATE "subscriptions_info" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "unit_head_overloading" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "unit_head_overloading" ADD CONSTRAINT "unit_head_overloading_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "unit_head_overloading_org_id_idx" ON "unit_head_overloading"("org_id");
UPDATE "unit_head_overloading" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "student_teacher_ratio" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "student_teacher_ratio" ADD CONSTRAINT "student_teacher_ratio_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "student_teacher_ratio_org_id_idx" ON "student_teacher_ratio"("org_id");
UPDATE "student_teacher_ratio" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "stress_evaluation_history" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "stress_evaluation_history" ADD CONSTRAINT "stress_evaluation_history_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "stress_evaluation_history_org_id_idx" ON "stress_evaluation_history"("org_id");
UPDATE "stress_evaluation_history" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "WorkSamplingStudy" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "WorkSamplingStudy" ADD CONSTRAINT "WorkSamplingStudy_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "WorkSamplingStudy_org_id_idx" ON "WorkSamplingStudy"("org_id");
UPDATE "WorkSamplingStudy" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "appraisal_period" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "appraisal_period" ADD CONSTRAINT "appraisal_period_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "appraisal_period_org_id_idx" ON "appraisal_period"("org_id");
UPDATE "appraisal_period" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "appraisal_template" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "appraisal_template" ADD CONSTRAINT "appraisal_template_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "appraisal_template_org_id_idx" ON "appraisal_template"("org_id");
UPDATE "appraisal_template" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "org_template_choice" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "org_template_choice" ADD CONSTRAINT "org_template_choice_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "org_template_choice_org_id_idx" ON "org_template_choice"("org_id");
UPDATE "org_template_choice" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "appraisal_target" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "appraisal_target" ADD CONSTRAINT "appraisal_target_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "appraisal_target_org_id_idx" ON "appraisal_target"("org_id");
UPDATE "appraisal_target" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "appraisal_entry" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "appraisal_entry" ADD CONSTRAINT "appraisal_entry_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "appraisal_entry_org_id_idx" ON "appraisal_entry"("org_id");
UPDATE "appraisal_entry" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "appraisal_course" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "appraisal_course" ADD CONSTRAINT "appraisal_course_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "appraisal_course_org_id_idx" ON "appraisal_course"("org_id");
UPDATE "appraisal_course" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "appraisal_indicator" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "appraisal_indicator" ADD CONSTRAINT "appraisal_indicator_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "appraisal_indicator_org_id_idx" ON "appraisal_indicator"("org_id");
UPDATE "appraisal_indicator" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "performance_period" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "performance_period" ADD CONSTRAINT "performance_period_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "performance_period_org_id_idx" ON "performance_period"("org_id");
UPDATE "performance_period" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "performance_entry" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "performance_entry" ADD CONSTRAINT "performance_entry_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "performance_entry_org_id_idx" ON "performance_entry"("org_id");
UPDATE "performance_entry" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "hod_performance_rater" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "hod_performance_rater" ADD CONSTRAINT "hod_performance_rater_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "hod_performance_rater_org_id_idx" ON "hod_performance_rater"("org_id");
UPDATE "hod_performance_rater" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "hod_performance_result" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "hod_performance_result" ADD CONSTRAINT "hod_performance_result_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "hod_performance_result_org_id_idx" ON "hod_performance_result"("org_id");
UPDATE "hod_performance_result" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "webhook_deliveries" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "webhook_deliveries_org_id_idx" ON "webhook_deliveries"("org_id");
UPDATE "webhook_deliveries" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "org_entitlements" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "org_entitlements" ADD CONSTRAINT "org_entitlements_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "org_entitlements_org_id_idx" ON "org_entitlements"("org_id");
UPDATE "org_entitlements" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

ALTER TABLE "model_access" ADD COLUMN "org_id" INTEGER;
ALTER TABLE "model_access" ADD CONSTRAINT "model_access_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id");
CREATE INDEX "model_access_org_id_idx" ON "model_access"("org_id");
UPDATE "model_access" t SET org_id = o.id FROM "org" o WHERE o.name = t.org AND t.org_id IS NULL;

