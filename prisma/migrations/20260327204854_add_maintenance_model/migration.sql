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

    CONSTRAINT "OptimizationResult_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "counter_stress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_userperformance" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "org" VARCHAR(255),
    "dept" VARCHAR(255),
    "competence" DECIMAL(5,2),
    "integrity" DECIMAL(5,2),
    "compatibility" DECIMAL(5,2),
    "use_of_resources" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "pending" BOOLEAN DEFAULT false,

    CONSTRAINT "counter_userperformance_pkey" PRIMARY KEY ("id")
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
    "maintenance_model" BOOLEAN NOT NULL DEFAULT false,

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
    "manage_user" TEXT,
    "access_em" TEXT,
    "ae_all" TEXT,
    "ae_sub" TEXT,
    "ae_sel" TEXT,
    "define_performance" TEXT,
    "dp_all" TEXT,
    "dp_sub" TEXT,
    "dp_sel" TEXT,
    "access_hierachy" TEXT,
    "manage_review" TEXT,
    "mr_all" TEXT,
    "mr_sub" TEXT,
    "mr_sel" TEXT,
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
    "b" DECIMAL(10,2),
    "w" DECIMAL(10,2),
    "p0" DECIMAL(6,3),
    "t1" DECIMAL(6,3),
    "t2" DECIMAL(6,3),
    "t3" DECIMAL(6,3),
    "t4" DECIMAL(6,3),
    "s0" DECIMAL(6,3),
    "g" DECIMAL(10,2),
    "d" DECIMAL(10,2),
    "y" DECIMAL(6,3),
    "alpha" DECIMAL(6,3),
    "lambda" DECIMAL(6,3),
    "mu" DECIMAL(6,3),
    "j" DECIMAL(10,2),
    "kmin" INTEGER,
    "kmax" INTEGER,
    "kstar" INTEGER,
    "hstar" DECIMAL(12,6),
    "constraints_ok" BOOLEAN DEFAULT true,
    "violations" TEXT[],
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personnel_utilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesuser" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "gsm" VARCHAR(50),
    "role" VARCHAR(50),
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

    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
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
    "dept" VARCHAR(255),

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
CREATE TABLE "userperformance" (
    "id" SERIAL NOT NULL,
    "pesuser_name" VARCHAR(255) NOT NULL,
    "org" VARCHAR(255),
    "competence" DECIMAL,
    "integrity" DECIMAL,
    "compatibility" DECIMAL,
    "use_of_resources" DECIMAL,
    "dept" VARCHAR(255) DEFAULT 'mechanical engineering',
    "pending" BOOLEAN DEFAULT false,
    "resolve" BOOLEAN DEFAULT false,

    CONSTRAINT "userperformance_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "unique_user_per_dept_org" ON "pesuser"("name", "dept", "org");

-- CreateIndex
CREATE UNIQUE INDEX "plans_paypal_plan_id_key" ON "plans"("paypal_plan_id");

-- CreateIndex
CREATE INDEX "idx_second_book_category" ON "second_book_of_record"("category");

-- CreateIndex
CREATE INDEX "idx_second_book_date" ON "second_book_of_record"("date_achieved");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_paypal_subscription_id_key" ON "subscriptions"("paypal_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_info_reference_key" ON "subscriptions_info"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "userperformance_unique" ON "userperformance"("pesuser_name", "org", "dept");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "pesuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_pesuser_id_fkey" FOREIGN KEY ("pesuser_id") REFERENCES "pesuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
