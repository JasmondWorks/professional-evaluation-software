# Raw SQL → Prisma ORM migration tracker

Converting all `app/api` raw queries ($queryRaw / $queryRawUnsafe / $executeRaw*) to typed Prisma model calls.

## Rules applied to every file
- Replace raw SELECT/INSERT/UPDATE/DELETE with typed `prisma.<model>.*` calls where feasible.
- Remove per-request `prisma.$disconnect()` (shared singleton must stay open).
- Keep genuinely complex SQL (aggregations/CTEs/window fns) as `$queryRaw` **tagged-template** (never `Unsafe` with interpolation) — note these under "Kept raw (justified)".
- Typecheck (`npx tsc --noEmit`) must pass after each chunk.

Status legend: [ ] pending · [~] in progress · [x] done · [R] intentionally kept raw

## Files ($disconnect flag = has per-request disconnect to remove)

- [x] `app/api/acceptReject/route.ts`
- [x] `app/api/achievements/route.ts`
- [x] `app/api/addEmployee/route.ts` — + P2002 duplicate handling, frontend toast
- [x] `app/api/addFacility/route.ts`  ⚠disconnect
- [x] `app/api/addGoals/route.ts`
- [x] `app/api/addPersonnelIndex/route.ts`
- [x] `app/api/addRoles/route.ts`  ⚠disconnect
- [x] `app/api/admin/all-auditors/route.ts`
- [x] `app/api/admin/auditors/route.ts`
- [x] `app/api/admin/login/route.ts`  ⚠disconnect
- [x] `app/api/admin/orgs/[org]/auditors/route.ts`
- [x] `app/api/admin/orgs/[org]/users/route.ts`
- [x] `app/api/admin/users-by-org/route.ts`
- [x] `app/api/admin/users/[id]/route.ts`
- [x] `app/api/appraisal/route.ts`
- [x] `app/api/assign-admin/route.ts`
- [x] `app/api/assign-hod/route.ts`
- [x] `app/api/assign-prod/route.ts`
- [x] `app/api/auditor-responses/route.ts`
- [x] `app/api/counterAppraisal/route.ts`
- [x] `app/api/counterStress/route.ts`
- [x] `app/api/counterTotals/route.ts`
- [x] `app/api/counterUserPerformance/route.ts`
- [x] `app/api/delete-user/route.ts`
- [x] `app/api/first-book-api/appraisal/route.ts`
- [x] `app/api/first-book-api/performance/route.ts`
- [x] `app/api/getAllDataScores/route.ts`
- [R] `app/api/getAppraisalData/route.ts` — COUNT(DISTINCT) GROUP BY, safe tagged template
- [R] `app/api/getDataEntry/route.ts` — multi-table UNION DISTINCT + COUNT
- [R] `app/api/getDataEntryByDept/route.ts` — multi-table UNION DISTINCT
- [x] `app/api/getDataScores/route.ts`
- [x] `app/api/getDepartment/route.ts`  ⚠disconnect
- [x] `app/api/getEmployee/route.ts`  ⚠disconnect
- [x] `app/api/getFacility/route.ts`  ⚠disconnect
- [x] `app/api/getFlaggedScores/route.ts`
- [x] `app/api/getGoals/route.ts`  ⚠disconnect
- [x] `app/api/getInventory/route.ts`  ⚠disconnect
- [x] `app/api/getPerformance/route.ts`
- [R] `app/api/getPerformanceData/route.ts` — COUNT(DISTINCT) GROUP BY, safe tagged template
- [x] `app/api/getRoles/route.ts`  ⚠disconnect
- [x] `app/api/getStatData/route.ts`  ⚠disconnect
- [x] `app/api/getStats/route.ts`
- [x] `app/api/getStress/route.ts`
- [R] `app/api/getStressData/route.ts` — COUNT(DISTINCT) GROUP BY, safe tagged template
- [x] `app/api/getStressDataScores/route.ts`
- [x] `app/api/getStressScores/route.ts`
- [x] `app/api/getUser/route.ts`  ⚠disconnect
- [x] `app/api/getUserData/route.ts`  ⚠disconnect
- [x] `app/api/getUserProfile/route.ts`  ⚠disconnect
- [x] `app/api/getUsers/route.ts`  ⚠disconnect
- [x] `app/api/hall-of-fame/route.ts`
- [x] `app/api/hod-assign/route.ts`
- [x] `app/api/login/route.ts`
- [ ] `app/api/maintenance/verify/route.ts`
- [R] `app/api/modules/dataCheck.ts` — ORDER BY random() has no Prisma equivalent
- [x] `app/api/motivation/route.ts`
- [x] `app/api/nonAcademicAppraisal/route.ts`
- [x] `app/api/notifications/route.ts`  ⚠disconnect
- [x] `app/api/org/[org]/route.ts`
- [x] `app/api/orgStructure/route.ts`
- [x] `app/api/orgs/route.ts`
- [ ] `app/api/paypal-wehook/route.ts`
- [ ] `app/api/paypal/subscribe/route.ts`
- [ ] `app/api/paypal/webhook/route.ts`
- [ ] `app/api/paystack/upgrade/route.ts`
- [ ] `app/api/paystack/webhook/route.ts`
- [x] `app/api/performance-single/route.ts`
- [x] `app/api/personnelRedundancy/route.ts`
- [x] `app/api/personnelUtilization/route.ts`
- [x] `app/api/removeGoal/route.ts`  ⚠disconnect
- [x] `app/api/resendCredentials/route.ts`  ⚠disconnect
- [x] `app/api/results/route.ts`
- [R] `app/api/runMigration/route.ts` — raw DDL (ALTER TABLE) migration utility
- [x] `app/api/saveAppraisal/route.ts`
- [x] `app/api/saveAuditorAppraisal/route.ts`
- [x] `app/api/saveLeadScores/route.ts`
- [x] `app/api/savePerformance/route.ts`
- [x] `app/api/savePerformanceResult/route.ts`
- [x] `app/api/saveStress/route.ts`
- [x] `app/api/saveStressAssessment/route.ts`
- [x] `app/api/saveStressScores/route.ts`
- [x] `app/api/second-book-api/appraisal/route.ts`
- [x] `app/api/second-book-api/performance/route.ts`
- [x] `app/api/staffAppraisal/route.ts`
- [x] `app/api/staffEstimation/route.ts`
- [x] `app/api/stress-analysis/route.ts`
- [x] `app/api/stress/route.ts`
- [ ] `app/api/subByPaypal/route.ts`
- [ ] `app/api/subscriptions/active/route.ts`
- [ ] `app/api/subscriptions/upgrade/route.ts`
- [x] `app/api/survey-response/auditor/route.ts`
- [x] `app/api/survey-response/staff/route.ts`
- [x] `app/api/toggleEvaluation/route.ts`  ⚠disconnect
- [x] `app/api/unitHead/route.ts`
- [x] `app/api/updateGoals/route.ts`  ⚠disconnect
- [x] `app/api/userPerformance/route.ts`
- [x] `app/api/users/delete/route.ts`
- [R] `app/api/workSampling/observations/route.ts` — no Prisma models (WorkSampling* tables managed by raw DDL)
- [R] `app/api/workSampling/positions/route.ts` — no Prisma models (WorkSampling* tables managed by raw DDL)
- [R] `app/api/workSampling/studies/[id]/route.ts` — no Prisma model (WorkSampling* raw DDL)
- [R] `app/api/workSampling/studies/route.ts` — no Prisma models (WorkSampling* tables managed by raw DDL)

## Schema-drift reconciliation (done 2026-07-07)

Added to `schema.prisma` + `db push` (shapes were unambiguous from the code):
- `counter_totals` model → wired up `/api/counterTotals`
- `hod_assignments` model (unique on hod_id+user_id) → wired up `/api/hod-assign`
- `pesuser.audit_count Int?` → wired up `/api/admin/auditors` approve flow

Code fixes (were writing to nonexistent tables/columns; no schema change needed):
- `savePerformance` — wrote to `counteruserperformance` (typo) → now `counter_userperformance`/`userperformance`
- `saveAppraisal` — wrote a phantom `payload` jsonb → now writes the individual evaluation columns on `appraisal`/`counter_appraisal`

### Still NEEDS A PRODUCT DECISION (not touched)
`stress` / `counter_stress` are referenced with columns that don't exist and imply a
redesign: `stress_category`, `stress_theme_form`, `stress_feeling_frequency_form`
(strings/JSON) vs the current `stress_theme` / `stress_feeling_frequency` (Int).
Affected: `saveStressAssessment` (writes JSON/strings into the Int columns) and the two
stress reads in `getDataScores`. Decide the intended stress data model before converting.

## Stress redesign (2026-07-08)

Resolved the stress data-model ambiguity (additive, keeps existing data):
- `stress` model: added `stress_category`, `stress_theme_form`, `stress_feeling_frequency_form` (Int?) + `assessment_data` (Json?)
- `counter_stress` model: added `stress_theme_form`, `stress_feeling_frequency_form` (Int?)
- `getDataScores` stress + counter_stress reads → converted to ORM
- `saveStressAssessment` → now writes structured JSON to `assessment_data` (was cramming JSON into the Int `stress_theme` column)

⚠️ PENDING: `npx prisma db push` to apply these columns to the DB (Docker was down at time of change). Schema + generated client + code are all updated and typecheck-clean.
