-- Phase 2 (finalization, breaking): swaps composite unique/index constraints from
-- org (name) to org_id, sets org_id NOT NULL wherever org was required, and drops
-- the legacy org string columns. Verified: no org_id NULLs in required-org tables,
-- application code confirmed reading/writing org_id exclusively (typecheck clean,
-- manual cross-tenant isolation test passed).

DROP INDEX "appraisal_unique";
CREATE UNIQUE INDEX "appraisal_unique" ON "appraisal"("pesuser_name", "org_id", "dept");

DROP INDEX "unique_user_per_dept_org";
CREATE UNIQUE INDEX "unique_user_per_dept_org" ON "pesuser"("name", "dept", "org_id");
DROP INDEX "pesuser_org_management_level_idx";
CREATE INDEX "pesuser_org_management_level_idx" ON "pesuser"("org_id", "management_level");

DROP INDEX "roles_name_org_key";
CREATE UNIQUE INDEX "roles_name_org_key" ON "roles"("name", "org_id");

DROP INDEX "org_template_choice_unique";
CREATE UNIQUE INDEX "org_template_choice_unique" ON "org_template_choice"("org_id", "scope");

DROP INDEX "appraisal_target_unique";
CREATE UNIQUE INDEX "appraisal_target_unique" ON "appraisal_target"("org_id", "period_id", "model", "position", "post", "cadre", "category");
DROP INDEX "appraisal_target_org_model_idx";
CREATE INDEX "appraisal_target_org_model_idx" ON "appraisal_target"("org_id", "model");

DROP INDEX "appraisal_course_unique";
CREATE UNIQUE INDEX "appraisal_course_unique" ON "appraisal_course"("org_id", "period_id", "code");
DROP INDEX "appraisal_course_org_period_id_idx";
CREATE INDEX "appraisal_course_org_period_id_idx" ON "appraisal_course"("org_id", "period_id");

DROP INDEX "org_entitlements_unique";
CREATE UNIQUE INDEX "org_entitlements_unique" ON "org_entitlements"("org_id", "entitlement_key");
DROP INDEX "org_entitlements_org_idx";
CREATE INDEX "org_entitlements_org_idx" ON "org_entitlements"("org_id");

DROP INDEX "model_access_unique";
CREATE UNIQUE INDEX "model_access_unique" ON "model_access"("org_id", "role", "model_key");
DROP INDEX "model_access_org_role_idx";
CREATE INDEX "model_access_org_role_idx" ON "model_access"("org_id", "role");

DROP INDEX "motivation_scheme_org_active_idx";
CREATE INDEX "motivation_scheme_org_active_idx" ON "motivation_scheme"("org_id", "active");

DROP INDEX "motivation_award_org_period_idx";
CREATE INDEX "motivation_award_org_period_idx" ON "motivation_award"("org_id", "period_label");

DROP INDEX "appraisal_period_org_status_idx";
CREATE INDEX "appraisal_period_org_status_idx" ON "appraisal_period"("org_id", "status");

DROP INDEX "appraisal_entry_org_status_idx";
CREATE INDEX "appraisal_entry_org_status_idx" ON "appraisal_entry"("org_id", "status");
DROP INDEX "appraisal_entry_org_flagged_idx";
CREATE INDEX "appraisal_entry_org_flagged_idx" ON "appraisal_entry"("org_id", "flagged");

DROP INDEX "appraisal_indicator_org_period_id_pesuser_name_idx";
CREATE INDEX "appraisal_indicator_org_period_id_pesuser_name_idx" ON "appraisal_indicator"("org_id", "period_id", "pesuser_name");

DROP INDEX "appraisal_template_org_scope_status_idx";
CREATE INDEX "appraisal_template_org_scope_status_idx" ON "appraisal_template"("org_id", "scope", "status");

DROP INDEX "performance_period_org_status_idx";
CREATE INDEX "performance_period_org_status_idx" ON "performance_period"("org_id", "status");

DROP INDEX "performance_entry_org_status_idx";
CREATE INDEX "performance_entry_org_status_idx" ON "performance_entry"("org_id", "status");
DROP INDEX "performance_entry_org_flagged_idx";
CREATE INDEX "performance_entry_org_flagged_idx" ON "performance_entry"("org_id", "flagged");

DROP INDEX "hod_performance_rater_org_period_id_hod_name_idx";
CREATE INDEX "hod_performance_rater_org_period_id_hod_name_idx" ON "hod_performance_rater"("org_id", "period_id", "hod_name");

DROP INDEX "hod_performance_result_org_period_id_idx";
CREATE INDEX "hod_performance_result_org_period_id_idx" ON "hod_performance_result"("org_id", "period_id");

DROP INDEX "maintenance_run_org_created_idx";
CREATE INDEX "maintenance_run_org_created_idx" ON "maintenance_run"("org_id", "created_at" DESC);
DROP INDEX "maintenance_run_facility_idx";
CREATE INDEX "maintenance_run_facility_idx" ON "maintenance_run"("org_id", "facility_id");

DROP INDEX "StressCycle_org_idx";
CREATE INDEX "StressCycle_org_idx" ON "StressCycle"("org_id");

DROP INDEX "WellbeingSession_org_idx";
CREATE INDEX "WellbeingSession_org_idx" ON "WellbeingSession"("org_id");

ALTER TABLE "OptimizationResult" DROP COLUMN "org";
ALTER TABLE "StressCycle" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "StressCycle" DROP COLUMN "org";
ALTER TABLE "WellbeingSession" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "WellbeingSession" DROP COLUMN "org";
ALTER TABLE "StaffEstimation" DROP COLUMN "org";
ALTER TABLE "appraisal" DROP COLUMN "org";
ALTER TABLE "auditor_survey_responses" DROP COLUMN "org";
ALTER TABLE "counter_appraisal" DROP COLUMN "org";
ALTER TABLE "counter_stress" DROP COLUMN "org";
ALTER TABLE "facilities" DROP COLUMN "org";
ALTER TABLE "index" DROP COLUMN "org";
ALTER TABLE "motivation" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "motivation" DROP COLUMN "org";
ALTER TABLE "maintenance_run" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "maintenance_run" DROP COLUMN "org";
ALTER TABLE "motivation_scheme" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "motivation_scheme" DROP COLUMN "org";
ALTER TABLE "motivation_award" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "motivation_award" DROP COLUMN "org";
ALTER TABLE "non_academic_appraisal" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "non_academic_appraisal" DROP COLUMN "org";
ALTER TABLE "notifications" DROP COLUMN "org";
ALTER TABLE "org_structure_results" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "org_structure_results" DROP COLUMN "org";
ALTER TABLE "performance_result" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "performance_result" DROP COLUMN "org";
ALTER TABLE "permission" DROP COLUMN "org";
ALTER TABLE "personnel_redundancy" DROP COLUMN "org";
ALTER TABLE "personnel_utilization" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "personnel_utilization" DROP COLUMN "org";
ALTER TABLE "supervision_cost" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "supervision_cost" DROP COLUMN "org";
ALTER TABLE "pesuser" DROP COLUMN "org";
ALTER TABLE "roles" DROP COLUMN "org";
ALTER TABLE "staff_appraisal_results" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "staff_appraisal_results" DROP COLUMN "org";
ALTER TABLE "staff_motivation" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "staff_motivation" DROP COLUMN "org";
ALTER TABLE "staff_survey_responses" DROP COLUMN "org";
ALTER TABLE "stress" DROP COLUMN "org";
ALTER TABLE "stress_analysis_results" DROP COLUMN "org";
ALTER TABLE "stress_scores" DROP COLUMN "org";
ALTER TABLE "subscriptions_info" DROP COLUMN "org";
ALTER TABLE "unit_head_overloading" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "unit_head_overloading" DROP COLUMN "org";
ALTER TABLE "student_teacher_ratio" DROP COLUMN "org";
ALTER TABLE "stress_evaluation_history" DROP COLUMN "org";
ALTER TABLE "WorkSamplingStudy" DROP COLUMN "org";
ALTER TABLE "appraisal_period" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "appraisal_period" DROP COLUMN "org";
ALTER TABLE "appraisal_template" DROP COLUMN "org";
ALTER TABLE "org_template_choice" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "org_template_choice" DROP COLUMN "org";
ALTER TABLE "appraisal_target" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "appraisal_target" DROP COLUMN "org";
ALTER TABLE "appraisal_entry" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "appraisal_entry" DROP COLUMN "org";
ALTER TABLE "appraisal_course" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "appraisal_course" DROP COLUMN "org";
ALTER TABLE "appraisal_indicator" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "appraisal_indicator" DROP COLUMN "org";
ALTER TABLE "performance_period" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "performance_period" DROP COLUMN "org";
ALTER TABLE "performance_entry" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "performance_entry" DROP COLUMN "org";
ALTER TABLE "hod_performance_rater" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "hod_performance_rater" DROP COLUMN "org";
ALTER TABLE "hod_performance_result" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "hod_performance_result" DROP COLUMN "org";
ALTER TABLE "webhook_deliveries" DROP COLUMN "org";
ALTER TABLE "org_entitlements" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "org_entitlements" DROP COLUMN "org";
ALTER TABLE "model_access" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "model_access" DROP COLUMN "org";
