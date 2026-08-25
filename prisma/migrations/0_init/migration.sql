-- CreateTable
CREATE TABLE "OptimizationResult" (
    "id" SERIAL NOT NULL,
    "mode" VARCHAR(50) NOT NULL,
    "optimalK" INTEGER NOT NULL,
    "efficiencyValue" DOUBLE PRECISION,
    "totalStaffNeeded" INTEGER NOT NULL,
    "supervisoryStaff" INTEGER,
    "managementLevel1" INTEGER,
    "managementLevel2" INTEGER,
    "topManagementStaff" INTEGER,
    "lecturers" INTEGER,
    "seniorLecturers" INTEGER,
    "professors" INTEGER,
    "studentPopulation" INTEGER,
    "D" DOUBLE PRECISION,
    "G" DOUBLE PRECISION,
    "Y" DOUBLE PRECISION,
    "alpha" DOUBLE PRECISION,
    "t1" DOUBLE PRECISION,
    "t2" DOUBLE PRECISION,
    "t3" DOUBLE PRECISION,
    "t4" DOUBLE PRECISION,
    "S0" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "org" VARCHAR(255),

    CONSTRAINT "OptimizationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StressCycle" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "phase" VARCHAR(30) NOT NULL DEFAULT 'settings_open',
    "mode" VARCHAR(20) NOT NULL DEFAULT 'once',
    "settings_opens_at" TIMESTAMP(3),
    "settings_closes_at" TIMESTAMP(3),
    "feeling_opens_at" TIMESTAMP(3),
    "feeling_closes_at" TIMESTAMP(3),
    "category_limits" JSONB,
    "needs_reset" BOOLEAN NOT NULL DEFAULT false,
    "session_id" INTEGER,
    "iteration" INTEGER,
    "limits_source" VARCHAR(30),
    "inherited_from_cycle_id" INTEGER,
    "created_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StressCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellbeingSession" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "current_iteration" INTEGER NOT NULL DEFAULT 0,
    "f1_feeling_value" DOUBLE PRECISION,
    "f1_category_limits" JSONB,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ended_reason" VARCHAR(255),
    "created_by" VARCHAR(255),

    CONSTRAINT "WellbeingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeelingResult" (
    "id" SERIAL NOT NULL,
    "cycle_id" INTEGER NOT NULL,
    "session_id" INTEGER,
    "feeling_mean" DOUBLE PRECISION,
    "within_f1_band" BOOLEAN,
    "triggered_reset" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeelingResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffEstimation" (
    "id" SERIAL NOT NULL,
    "methodType" VARCHAR(50) NOT NULL,
    "staffNeeded" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "basicTime" DOUBLE PRECISION,
    "relaxAllowance" DOUBLE PRECISION,
    "loadFactor" DOUBLE PRECISION,
    "numTasks" INTEGER,
    "timePerTask" DOUBLE PRECISION,
    "availableHoursPerPerson" DOUBLE PRECISION,
    "observedTime" DOUBLE PRECISION,
    "estimatedTime" DOUBLE PRECISION,
    "correctiveFactor" DOUBLE PRECISION,
    "personsEstimate" DOUBLE PRECISION,
    "A" DOUBLE PRECISION,
    "B" DOUBLE PRECISION,
    "confidenceLimit" DOUBLE PRECISION,
    "utilizationFactor" DOUBLE PRECISION,
    "annualManHours" DOUBLE PRECISION,
    "standardManHours" DOUBLE PRECISION,
    "org" VARCHAR(255),

    CONSTRAINT "StaffEstimation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "org" VARCHAR(255),
    "teaching_quality_evaluation" DECIMAL,
    "research_quality_evaluation" DECIMAL,
    "administrative_quality_evaluation" DECIMAL,
    "community_quality_evaluation" DECIMAL,
    "other_relevant_information" DECIMAL,
    "dept" VARCHAR(255) DEFAULT 'mechanical engineering',
    "pending" BOOLEAN DEFAULT false,
    "resolve" BOOLEAN DEFAULT false,

    CONSTRAINT "appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditor_responses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "gsm" VARCHAR(50) NOT NULL,
    "address" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "image" VARCHAR(255),
    "responses" JSONB NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditor_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditor_survey_responses" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255),
    "org" VARCHAR(255),
    "section" VARCHAR(100),
    "question" VARCHAR(255),
    "response" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditor_survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "sub_category" VARCHAR(100),
    "image_url" VARCHAR(500),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_appraisal" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "org" VARCHAR(255),
    "teaching_quality_evaluation" DECIMAL(5,2),
    "research_quality_evaluation" DECIMAL(5,2),
    "administrative_quality_evaluation" DECIMAL(5,2),
    "community_quality_evaluation" DECIMAL(5,2),
    "other_relevant_information" TEXT,
    "dept" VARCHAR(255),
    "pending" BOOLEAN DEFAULT false,

    CONSTRAINT "counter_appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_stress" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "org" VARCHAR(255),
    "dept" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "stress_theme" INTEGER,
    "stress_feeling_frequency" INTEGER,
    "stress_theme_form" INTEGER,
    "stress_feeling_frequency_form" INTEGER,

    CONSTRAINT "counter_stress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" SERIAL NOT NULL,
    "identification_symbol" VARCHAR(100),
    "description_of_facility" TEXT NOT NULL,
    "location" TEXT,
    "facility_register_id_no" VARCHAR(100),
    "type" VARCHAR(100),
    "priority_rating" VARCHAR(50),
    "remarks" TEXT,
    "org" VARCHAR(255) DEFAULT 'DevSquad inc',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "first_book_of_record" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "achievement" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "date_achieved" DATE,
    "image_url" VARCHAR(500),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "sub_category" VARCHAR(100),

    CONSTRAINT "first_book_of_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" INTEGER,
    "day_started" DATE,
    "due_date" DATE,
    "user_id" TEXT NOT NULL,
    "dept" VARCHAR(255) DEFAULT 'mechnical engineering',

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hall_of_fame" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "image_url" VARCHAR(500),
    "year" VARCHAR(4),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hall_of_fame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "index" (
    "id" SERIAL NOT NULL,
    "redundancy" DECIMAL,
    "productivity" DECIMAL,
    "utility" DECIMAL,
    "dept" VARCHAR(255),
    "org" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_scores" (
    "pesuser_name" VARCHAR(255) NOT NULL,
    "dept" VARCHAR(255) NOT NULL,
    "competence" DOUBLE PRECISION,
    "integrity" DOUBLE PRECISION,
    "compatibility" DOUBLE PRECISION,
    "use_of_resources" DOUBLE PRECISION,

    CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("pesuser_name","dept")
);

-- CreateTable
CREATE TABLE "motivation" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "total_score" DECIMAL(10,2) NOT NULL,
    "rating" TEXT NOT NULL,
    "thresholds" JSONB NOT NULL,
    "categories" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "non_academic_appraisal" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "output" DECIMAL(10,2) NOT NULL,
    "quality" DECIMAL(10,2) NOT NULL,
    "efficiency" DECIMAL(10,2) NOT NULL,
    "attendance" DECIMAL(10,2) NOT NULL,
    "teamwork" DECIMAL(10,2) NOT NULL,
    "total_score" DECIMAL(10,2) NOT NULL,
    "rating" TEXT NOT NULL,
    "thresholds" JSONB NOT NULL,
    "weights" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "non_academic_appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "org" VARCHAR(255),
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "plan" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "evaluation" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ongoing" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_model" BOOLEAN,

    CONSTRAINT "org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_structure_results" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "section" INTEGER NOT NULL,
    "result" DECIMAL(10,4),
    "numerator" DECIMAL[],
    "denominator" DECIMAL[],
    "extra_data" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_structure_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance" (
    "id" SERIAL NOT NULL,
    "dept" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "yield" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_result" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "total_score" DECIMAL(10,2) NOT NULL,
    "rating" TEXT NOT NULL,
    "thresholds" JSONB NOT NULL,
    "criteria" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "can_manage_user_roles" BOOLEAN NOT NULL DEFAULT false,
    "can_access_employee_data" BOOLEAN NOT NULL DEFAULT false,
    "access_employee_all" BOOLEAN NOT NULL DEFAULT false,
    "access_employee_subordinates" BOOLEAN NOT NULL DEFAULT false,
    "access_employee_selected" BOOLEAN NOT NULL DEFAULT false,
    "can_define_performance_metrics" BOOLEAN NOT NULL DEFAULT false,
    "define_performance_all" BOOLEAN NOT NULL DEFAULT false,
    "define_performance_subordinates" BOOLEAN NOT NULL DEFAULT false,
    "define_performance_selected" BOOLEAN NOT NULL DEFAULT false,
    "can_access_reporting_hierarchy" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_performance_reviews" BOOLEAN NOT NULL DEFAULT false,
    "manage_reviews_all" BOOLEAN NOT NULL DEFAULT false,
    "manage_reviews_subordinates" BOOLEAN NOT NULL DEFAULT false,
    "manage_reviews_selected" BOOLEAN NOT NULL DEFAULT false,
    "user_id" VARCHAR(255),
    "org" VARCHAR(255),

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_redundancy" (
    "id" SERIAL NOT NULL,
    "org" TEXT,
    "actual_staff" INTEGER NOT NULL,
    "optimal_staff" INTEGER NOT NULL,
    "low_threshold" INTEGER NOT NULL,
    "moderate_threshold" INTEGER NOT NULL,
    "pr_value" DECIMAL(6,2) NOT NULL,
    "rating" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personnel_redundancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_utilization" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "a_ij" DECIMAL(10,4),
    "lambda" DECIMAL(10,6),
    "mu" DECIMAL(10,6),
    "rho" DECIMAL(10,6),
    "p0" DECIMAL(10,6),
    "lbar" DECIMAL(10,6),
    "kmin" INTEGER,
    "kmax" INTEGER,
    "kstar" INTEGER,
    "hstar" DECIMAL(12,6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personnel_utilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervision_cost" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "a_ij" DECIMAL(10,4),
    "a_cost" DECIMAL(12,4),
    "b_cost" DECIMAL(12,4),
    "lambda" DECIMAL(10,6),
    "mu" DECIMAL(10,6),
    "rho" DECIMAL(10,6),
    "p0" DECIMAL(10,6),
    "lbar" DECIMAL(10,6),
    "kmin" INTEGER,
    "kmax" INTEGER,
    "kstar" INTEGER,
    "dstar" DECIMAL(12,6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supervision_cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesuser" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "gsm" VARCHAR(50),
    "email_status" VARCHAR(30),
    "email_status_at" TIMESTAMP(3),
    "view_department_stress" BOOLEAN NOT NULL DEFAULT false,
    "view_faculty_stress" BOOLEAN NOT NULL DEFAULT false,
    "role" VARCHAR(50),
    "display_role" VARCHAR(255),
    "address" TEXT,
    "faculty_college" VARCHAR(255),
    "dob" DATE,
    "doa" DATE,
    "poa" VARCHAR(255),
    "doc" VARCHAR(255),
    "post" VARCHAR(255),
    "dopp" DATE,
    "level" VARCHAR(50),
    "image" VARCHAR(255),
    "org" VARCHAR(255),
    "dept" VARCHAR(255),
    "tier" VARCHAR(50) DEFAULT 'bronze',
    "category" VARCHAR(100),
    "plan" VARCHAR(100),
    "resettoken" VARCHAR(255),
    "resettokenexpiry" TIMESTAMP(6),
    "audit_count" INTEGER DEFAULT 0,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesuser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paypal_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "currency_code" VARCHAR(10) NOT NULL,
    "billing_cycle_interval_unit" VARCHAR(10) NOT NULL,
    "billing_cycle_interval_count" INTEGER NOT NULL,
    "trial_days" INTEGER DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "assigned" INTEGER,
    "org" VARCHAR(255),
    "base_role" VARCHAR(50),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "second_book_of_record" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "achievement" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "date_achieved" DATE,
    "image_url" VARCHAR(500),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "sub_category" VARCHAR(100),

    CONSTRAINT "second_book_of_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_appraisal_results" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "cwh" DECIMAL(10,2),
    "cbh" DECIMAL(10,2),
    "hd" DECIMAL(10,2),
    "oq" DECIMAL(10,2),
    "wq" DECIMAL(10,2),
    "points" DECIMAL(10,2),
    "rtp" DECIMAL(10,2),
    "computed_appraisal_max_score" DECIMAL(10,2),
    "hod_max_score" DECIMAL(10,2),
    "na" DECIMAL(10,2),
    "ta" DECIMAL(10,2),
    "wasted_man_hours" DECIMAL(10,2),
    "wasted_cost" DECIMAL(10,2),
    "pidle" DECIMAL(10,2),
    "lost_hours" DECIMAL(10,2),
    "lost_cost" DECIMAL(10,2),
    "total_wasted_cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_appraisal_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_motivation" (
    "id" SERIAL NOT NULL,
    "org" INTEGER NOT NULL,
    "total_score" DECIMAL(10,2) NOT NULL,
    "rating" TEXT NOT NULL,
    "thresholds" JSONB NOT NULL,
    "categories" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_motivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_survey_responses" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "pesuser_email" VARCHAR(255) NOT NULL,
    "org" VARCHAR(255),
    "dept" VARCHAR(255),
    "responses" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stress" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "org" VARCHAR(255),
    "stress_theme" INTEGER,
    "stress_feeling_frequency" INTEGER,
    "stress_category" INTEGER,
    "stress_theme_form" INTEGER,
    "stress_feeling_frequency_form" INTEGER,
    "assessment_data" JSONB,
    "dept" VARCHAR(255),
    "cycle_id" INTEGER,
    "hod_approved" BOOLEAN NOT NULL DEFAULT false,
    "hod_approved_by" VARCHAR(255),
    "hod_approved_at" TIMESTAMP(3),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" VARCHAR(255),
    "approved_at" TIMESTAMP(3),
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "rejection_reason" TEXT,
    "rejected_by" VARCHAR(255),
    "rejected_at" TIMESTAMP(3),

    CONSTRAINT "stress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stress_analysis_results" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255),
    "group_by" VARCHAR(50),
    "ssto" DOUBLE PRECISION,
    "sstr" DOUBLE PRECISION,
    "sse" DOUBLE PRECISION,
    "f_statistic" DOUBLE PRECISION,
    "critical_value" DOUBLE PRECISION,
    "conclusion" TEXT,
    "df_between" INTEGER,
    "df_within" INTEGER,
    "ms_between" DOUBLE PRECISION,
    "ms_within" DOUBLE PRECISION,
    "mean" DOUBLE PRECISION,
    "std_dev" DOUBLE PRECISION,
    "cycle_id" INTEGER,
    "session_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stress_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stress_scores" (
    "id" SERIAL NOT NULL,
    "organizational" DECIMAL DEFAULT 0,
    "student" DECIMAL DEFAULT 0,
    "administrative" DECIMAL DEFAULT 0,
    "teacher" DECIMAL DEFAULT 0,
    "parents" DECIMAL DEFAULT 0,
    "occupational" DECIMAL DEFAULT 0,
    "personal" DECIMAL DEFAULT 0,
    "academic_program" DECIMAL DEFAULT 0,
    "negative_public_attitude" DECIMAL DEFAULT 0,
    "misc" DECIMAL DEFAULT 0,
    "org" VARCHAR(255),
    "dept" VARCHAR(255),
    "user_id" UUID,
    "user_name" VARCHAR(255),
    "cycle_id" INTEGER,

    CONSTRAINT "stress_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" TEXT NOT NULL,
    "event_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "subscription_id" BIGINT NOT NULL,

    CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "pesuser_id" INTEGER NOT NULL,
    "plan_id" UUID NOT NULL,
    "paypal_subscription_id" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "start_time" TIMESTAMPTZ(6),
    "next_billing_time" TIMESTAMPTZ(6),
    "last_billing_time" TIMESTAMPTZ(6),
    "cancel_time" TIMESTAMPTZ(6),
    "failed_payment_count" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "old_uuid_id" UUID,
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions_info" (
    "id" SERIAL NOT NULL,
    "pesuser_email" VARCHAR(255) NOT NULL,
    "pesuser_name" VARCHAR(255),
    "org" VARCHAR(255),
    "plan_code" VARCHAR(100) NOT NULL,
    "plan_name" VARCHAR(100),
    "reference" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "amount" DECIMAL(12,2),
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_head_overloading" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "actual_hours" DECIMAL(10,2) NOT NULL,
    "num_subordinates" INTEGER NOT NULL,
    "extra_complexity" DECIMAL(10,2) NOT NULL,
    "optimal_hours" DECIMAL(10,2) NOT NULL,
    "optimal_k" DECIMAL(10,2),
    "complexity_factor" DECIMAL(10,3) NOT NULL,
    "overload_ratio" DECIMAL(10,3) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_head_overloading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_teacher_ratio" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255),
    "dept" VARCHAR(255),
    "optimalK" INTEGER,
    "totalStaffNeeded" INTEGER,
    "supervisoryStaff" INTEGER,
    "managementLevel1" INTEGER,
    "managementLevel2" INTEGER,
    "topManagement" INTEGER,
    "lecturers" INTEGER,
    "seniorLecturers" INTEGER,
    "professors" INTEGER,
    "efficiencyValue" DECIMAL(10,4),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_teacher_ratio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stress_evaluation_history" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255),
    "stress_factor" DOUBLE PRECISION,
    "pressure_factor" DOUBLE PRECISION,
    "conflict_factor" DOUBLE PRECISION,
    "anova_result" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stress_evaluation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_totals" (
    "id" SERIAL NOT NULL,
    "section" INTEGER NOT NULL,
    "result" DECIMAL,
    "numerator" DECIMAL[],
    "denominator" DECIMAL[],
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counter_totals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hod_assignments" (
    "id" SERIAL NOT NULL,
    "hod_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hod_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSamplingStudy" (
    "id" SERIAL NOT NULL,
    "org" TEXT,
    "department" TEXT,
    "analyst" TEXT,
    "authorizedBy" TEXT,
    "confidenceLevel" DOUBLE PRECISION,
    "desiredAccuracy" DOUBLE PRECISION,
    "preliminaryP" DOUBLE PRECISION,
    "totalObservationsRequired" INTEGER,
    "studyMonth" TEXT,
    "studyMonths" JSONB,
    "observationsPerDay" INTEGER,
    "workingHoursPerDay" DOUBLE PRECISION,
    "workStartTime" TEXT,
    "minCycleDuration" DOUBLE PRECISION,
    "maxDuration" DOUBLE PRECISION,
    "estimatedStudyDays" DOUBLE PRECISION,
    "availableAnnualHours" DOUBLE PRECISION,
    "defaultPerformanceAllowance" DOUBLE PRECISION,
    "lockedDates" JSONB,
    "lockedTimes" JSONB,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkSamplingStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSamplingPosition" (
    "id" SERIAL NOT NULL,
    "studyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "performanceAllowance" DOUBLE PRECISION,

    CONSTRAINT "WorkSamplingPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSamplingObservation" (
    "id" SERIAL NOT NULL,
    "positionId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "isBusy" BOOLEAN,
    "performanceRating" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "WorkSamplingObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_period" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "frequency" VARCHAR(20) NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "opened_by" VARCHAR(255),
    "released_at" TIMESTAMP(6),
    "released_by" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_target" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER,
    "model" VARCHAR(20) NOT NULL,
    "position" VARCHAR(60),
    "post" VARCHAR(60),
    "cadre" VARCHAR(60),
    "category" VARCHAR(40),
    "target" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "appraisal_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_entry" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "dept" VARCHAR(255),
    "period_id" INTEGER NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "model" VARCHAR(20) NOT NULL,
    "position" VARCHAR(60),
    "post" VARCHAR(60),
    "cadre" VARCHAR(60),
    "total_observed" DECIMAL(12,3),
    "total_target" DECIMAL(12,3),
    "rtp" DECIMAL(10,3),
    "grade" VARCHAR(20),
    "partial_target" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(6),
    "approved_at" TIMESTAMP(6),
    "questionnaire" JSONB,
    "verified_at" TIMESTAMP(6),
    "verified_by" VARCHAR(255),
    "verification_note" TEXT,
    "dean_approved_at" TIMESTAMP(6),
    "dean_approved_by" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_category_score" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "line_items" JSONB,
    "quality" DECIMAL(6,2),
    "quantity" DECIMAL(12,4),
    "worth" INTEGER,
    "observed" DECIMAL(12,3),
    "target" DECIMAL(10,2),
    "appraisal_score" DECIMAL(6,2),
    "hod_score" DECIMAL(6,2),
    "hod_justification" TEXT,
    "staff_accepted" BOOLEAN,
    "reconciliation" VARCHAR(40),
    "recorded_score" DECIMAL(6,2),
    "auditor_score" DECIMAL(6,2),
    "auditor_note" TEXT,
    "copies_submitted" INTEGER,
    "student_count" INTEGER,
    "basic_units" DECIMAL(6,2),

    CONSTRAINT "appraisal_category_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_evidence" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "rule_key" VARCHAR(60) NOT NULL,
    "label" VARCHAR(255),
    "measure" DECIMAL(12,3) NOT NULL,
    "scripts" INTEGER,
    "evidence_url" VARCHAR(500),
    "units" DECIMAL(12,4),

    CONSTRAINT "appraisal_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_course" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER NOT NULL,
    "dept" VARCHAR(255),
    "title" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "unit" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_indicator" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "course_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appraisal_indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_period" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "frequency" VARCHAR(20) NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "opened_by" VARCHAR(255),
    "released_at" TIMESTAMP(6),
    "released_by" VARCHAR(255),
    "target" DECIMAL(6,2) NOT NULL DEFAULT 55.00,
    "rater_sample" INTEGER NOT NULL DEFAULT 5,
    "rater_minimum" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_entry" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "dept" VARCHAR(255),
    "period_id" INTEGER NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "overall" DECIMAL(6,2),
    "target" DECIMAL(6,2),
    "rtp" DECIMAL(10,3),
    "grade" VARCHAR(20),
    "class_rank" VARCHAR(20),
    "descriptive" VARCHAR(30),
    "partial" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(6),
    "evaluated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_criterion_score" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "criterion" VARCHAR(40) NOT NULL,
    "ratings" JSONB,
    "staff_score" DECIMAL(6,2),
    "hod_score" DECIMAL(6,2),
    "hod_justification" TEXT,
    "staff_accepted" BOOLEAN,
    "reconciliation" VARCHAR(40),
    "recorded_score" DECIMAL(6,2),
    "auditor_score" DECIMAL(6,2),
    "auditor_note" TEXT,

    CONSTRAINT "performance_criterion_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hod_performance_rater" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER NOT NULL,
    "dept" VARCHAR(255) NOT NULL,
    "hod_name" VARCHAR(255) NOT NULL,
    "rater_name" VARCHAR(255) NOT NULL,
    "management_ratings" JSONB,
    "productivity_ratings" JSONB,
    "management" DECIMAL(6,2),
    "productivity" DECIMAL(6,2),
    "submitted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hod_performance_rater_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hod_performance_result" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "period_id" INTEGER NOT NULL,
    "dept" VARCHAR(255) NOT NULL,
    "hod_name" VARCHAR(255) NOT NULL,
    "management" DECIMAL(6,2),
    "productivity" DECIMAL(6,2),
    "overall" DECIMAL(6,2),
    "target" DECIMAL(6,2),
    "rtp" DECIMAL(10,3),
    "grade" VARCHAR(20),
    "class_rank" VARCHAR(20),
    "descriptive" VARCHAR(30),
    "raters" INTEGER NOT NULL DEFAULT 0,
    "below_minimum" BOOLEAN NOT NULL DEFAULT false,
    "evaluated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hod_performance_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_access" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "role" VARCHAR(60) NOT NULL,
    "model_key" VARCHAR(60) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StressCycle_org_idx" ON "StressCycle"("org");

-- CreateIndex
CREATE INDEX "StressCycle_session_id_idx" ON "StressCycle"("session_id");

-- CreateIndex
CREATE INDEX "WellbeingSession_org_idx" ON "WellbeingSession"("org");

-- CreateIndex
CREATE INDEX "FeelingResult_cycle_id_idx" ON "FeelingResult"("cycle_id");

-- CreateIndex
CREATE INDEX "FeelingResult_session_id_idx" ON "FeelingResult"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_unique" ON "appraisal"("pesuser_name", "org", "dept");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_user_dept_unique" ON "appraisal"("pesuser_name", "dept");

-- CreateIndex
CREATE UNIQUE INDEX "auditor_responses_email_key" ON "auditor_responses"("email");

-- CreateIndex
CREATE INDEX "idx_first_book_category" ON "first_book_of_record"("category");

-- CreateIndex
CREATE INDEX "idx_first_book_date" ON "first_book_of_record"("date_achieved");

-- CreateIndex
CREATE INDEX "idx_hall_of_fame_name" ON "hall_of_fame"("name");

-- CreateIndex
CREATE INDEX "idx_hall_of_fame_year" ON "hall_of_fame"("year");

-- CreateIndex
CREATE UNIQUE INDEX "org_name_key" ON "org"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pesuser_id_unique" ON "pesuser"("id");

-- CreateIndex
CREATE UNIQUE INDEX "pesuser_email_key" ON "pesuser"("email");

-- CreateIndex
CREATE INDEX "idx_pesuser_resettoken" ON "pesuser"("resettoken");

-- CreateIndex
CREATE INDEX "idx_pesuser_resettokenexpiry" ON "pesuser"("resettokenexpiry");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_per_dept_org" ON "pesuser"("name", "dept", "org");

-- CreateIndex
CREATE UNIQUE INDEX "plans_paypal_plan_id_key" ON "plans"("paypal_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_org_key" ON "roles"("name", "org");

-- CreateIndex
CREATE INDEX "idx_second_book_category" ON "second_book_of_record"("category");

-- CreateIndex
CREATE INDEX "idx_second_book_date" ON "second_book_of_record"("date_achieved");

-- CreateIndex
CREATE INDEX "stress_analysis_results_cycle_id_idx" ON "stress_analysis_results"("cycle_id");

-- CreateIndex
CREATE INDEX "stress_analysis_results_session_id_idx" ON "stress_analysis_results"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_paypal_subscription_id_key" ON "subscriptions"("paypal_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_info_reference_key" ON "subscriptions_info"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "hod_assignments_hod_id_user_id_key" ON "hod_assignments"("hod_id", "user_id");

-- CreateIndex
CREATE INDEX "appraisal_period_org_status_idx" ON "appraisal_period"("org", "status");

-- CreateIndex
CREATE INDEX "appraisal_target_org_model_idx" ON "appraisal_target"("org", "model");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_target_unique" ON "appraisal_target"("org", "period_id", "model", "position", "post", "cadre", "category");

-- CreateIndex
CREATE INDEX "appraisal_entry_org_status_idx" ON "appraisal_entry"("org", "status");

-- CreateIndex
CREATE INDEX "appraisal_entry_org_flagged_idx" ON "appraisal_entry"("org", "flagged");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_entry_unique" ON "appraisal_entry"("period_id", "pesuser_name");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_category_unique" ON "appraisal_category_score"("entry_id", "category");

-- CreateIndex
CREATE INDEX "appraisal_evidence_entry_id_category_idx" ON "appraisal_evidence"("entry_id", "category");

-- CreateIndex
CREATE INDEX "appraisal_course_org_period_id_idx" ON "appraisal_course"("org", "period_id");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_course_unique" ON "appraisal_course"("org", "period_id", "code");

-- CreateIndex
CREATE INDEX "appraisal_indicator_org_period_id_pesuser_name_idx" ON "appraisal_indicator"("org", "period_id", "pesuser_name");

-- CreateIndex
CREATE INDEX "performance_period_org_status_idx" ON "performance_period"("org", "status");

-- CreateIndex
CREATE INDEX "performance_entry_org_status_idx" ON "performance_entry"("org", "status");

-- CreateIndex
CREATE INDEX "performance_entry_org_flagged_idx" ON "performance_entry"("org", "flagged");

-- CreateIndex
CREATE UNIQUE INDEX "performance_entry_unique" ON "performance_entry"("period_id", "pesuser_name");

-- CreateIndex
CREATE UNIQUE INDEX "performance_criterion_unique" ON "performance_criterion_score"("entry_id", "criterion");

-- CreateIndex
CREATE INDEX "hod_performance_rater_org_period_id_hod_name_idx" ON "hod_performance_rater"("org", "period_id", "hod_name");

-- CreateIndex
CREATE INDEX "hod_performance_rater_rater_name_idx" ON "hod_performance_rater"("rater_name");

-- CreateIndex
CREATE UNIQUE INDEX "hod_performance_rater_unique" ON "hod_performance_rater"("period_id", "hod_name", "rater_name");

-- CreateIndex
CREATE INDEX "hod_performance_result_org_period_id_idx" ON "hod_performance_result"("org", "period_id");

-- CreateIndex
CREATE UNIQUE INDEX "hod_performance_result_unique" ON "hod_performance_result"("period_id", "hod_name");

-- CreateIndex
CREATE INDEX "model_access_org_role_idx" ON "model_access"("org", "role");

-- CreateIndex
CREATE UNIQUE INDEX "model_access_unique" ON "model_access"("org", "role", "model_key");

-- AddForeignKey
ALTER TABLE "StressCycle" ADD CONSTRAINT "StressCycle_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "WellbeingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeelingResult" ADD CONSTRAINT "FeelingResult_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "StressCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeelingResult" ADD CONSTRAINT "FeelingResult_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "WellbeingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "pesuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_pesuser_id_fkey" FOREIGN KEY ("pesuser_id") REFERENCES "pesuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WorkSamplingPosition" ADD CONSTRAINT "WorkSamplingPosition_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "WorkSamplingStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSamplingObservation" ADD CONSTRAINT "WorkSamplingObservation_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "WorkSamplingPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_target" ADD CONSTRAINT "appraisal_target_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_entry" ADD CONSTRAINT "appraisal_entry_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_category_score" ADD CONSTRAINT "appraisal_category_score_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "appraisal_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_evidence" ADD CONSTRAINT "appraisal_evidence_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "appraisal_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_course" ADD CONSTRAINT "appraisal_course_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisal_indicator" ADD CONSTRAINT "appraisal_indicator_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "appraisal_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_entry" ADD CONSTRAINT "performance_entry_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "performance_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_criterion_score" ADD CONSTRAINT "performance_criterion_score_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "performance_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hod_performance_rater" ADD CONSTRAINT "hod_performance_rater_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "performance_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hod_performance_result" ADD CONSTRAINT "hod_performance_result_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "performance_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

