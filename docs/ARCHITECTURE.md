# PES — Professional Evaluation Software
### Architecture & Technical Documentation

> **Status:** Living document. Compiled from the codebase, the Prisma schema, and the
> *PES Project Details Form* (Dr. Omoregbee Henry Ogbemudia, 02‑07‑2026).
> Sections marked **⚠️ Assumption** are inferred from code, not confirmed by the owner —
> the project was handed over mid‑build, so some original intent is reconstructed.
> Sections marked **🔧 Tech debt** are known issues to address.

---

## 1. What this project is

**PES (Professional Evaluation Software)** is a multi‑tenant SaaS platform for running
**staff / personnel evaluations** and expressing **work‑environment conditions** (e.g. stress)
inside an organization. It serves three categories of organization:

- **Academic** (universities, faculties, departments)
- **Company** (private companies / industry)
- **Public / Civil Service**

On top of evaluation, PES adds a **staff‑recognition layer** — certificates, badges,
enrolment into the *First* and *Second Book of Records*, and the *Hall of Fame* — and a
**paid‑subscription layer** (Basic / Standard / Premium) billed through **Paystack** and **PayPal**.

The software runs evaluation **models** (mathematical/statistical calculations) whose results are
saved to the database, so an organization can measure staff performance, redundancy, utilization,
motivation, stress, and organizational structure over time.

### Business goals (from the owner)
1. Run evaluations and **save + view + chart** results over time (viewing is the biggest gap today).
2. Reward staff with certificates / badges / books of record / Hall of Fame.
3. Sell tiered subscriptions per organization.
4. Let the **software owner** pull registered **external auditor** details and invite them for training/deployment.
5. Push **broadcast notifications** to organization super‑admins (e.g. "new update" tickers).
6. Let staff take **surveys**; let the owner edit survey questions.
7. Enforce that **only specific roles** may trigger a calculation (see §6.1).

---

## 2. Technology stack

| Layer | Technology |
|---|---|
| Framework | **Next.js** (App Router, `app/`) — pages **and** API routes |
| Language | TypeScript / JavaScript (React) |
| Database | **PostgreSQL 15** |
| ORM | **Prisma 5.22** (`prisma-client-js`) |
| State (frontend) | **Redux** (`app/state/*`) |
| Auth | **JWT** (`jsonwebtoken`) + role cookie; passwords hashed with **bcryptjs** |
| Payments | **Paystack** and **PayPal** (subscriptions + one‑off maintenance unlock) |
| Cache | Redis (running locally; container `redis_cache`) |
| Local infra | Docker Compose — Postgres on host port **5434**, DB `pes_local` |

Domain (owner): `www.hooaij.com`.

### Repo layout (high level)
```
app/
  api/                  # All backend endpoints (Next.js route handlers)
  (admin)/              # Admin/data-entry UI (route group)
  admin/                # Admin auth + logged-in admin area ([org], super, auditor…)
  employee/             # Employee login area
  auditor/[id]/         # External auditor area
  components/           # Shared UI (assessment, data-entry-forms, subscription, ui…)
  state/                # Redux slices (user, goals, notification, loading…)
  lib/ , utils/         # Helpers (packages, paypalSetup…)
  hall-of-fame/ , book-of-record/ , reward/  # Recognition features
prisma/schema.prisma    # Data model (41 tables)
middleware.ts           # Role-based route guard
```

---

## 3. Actors / roles

Roles are stored on `pesuser.role` and enforced in [`middleware.ts`](../middleware.ts) via a
`role` cookie against the `role_access` list in
[`app/components/utils/tabs.tsx`](../app/components/utils/tabs.tsx).

| Role (code) | Who they are | Can access (from tabs) |
|---|---|---|
| `super-admin` | Organization owner / top admin | Dashboard, Employee DB, Goals, Assessment, Pricing, Maintenance |
| `admin` | Organization administrator | Same as super‑admin |
| `hod` | Head of Department | Dashboard, Employee DB, Goals, Data Entry, Performance, Maintenance |
| `lecturer` | Academic staff | Dashboard, Goals, Data Entry, Performance, Profile, Maintenance |
| `industrial-engineer` | Industrial / Production staff | Same as lecturer |
| `employee-w` | General employee/worker | Same as lecturer + Employee-facing views |
| `auditor` | **External** auditor | Dashboard, Data Entry, Profile |

Beyond PES organizations, there is one meta‑actor:

- **Software owner (RANDORA / Dr. Omoregbee)** — needs a cross‑org view: pull external‑auditor
  registrations, invite auditors, and broadcast updates to super‑admins. *(Owner‑level tooling is a
  requested deliverable; see §9.)*

> **⚠️ Naming note:** the DB and older code also use `prod` (production), `hod`, plain `admin`,
> `employee`, `staff` in places. The canonical set above (from `tabs.tsx`) should be treated as the
> source of truth and the older strings normalized. **🔧 Tech debt.**

---

## 4. Tenancy, org categories & subscription plans

### 4.1 Organizations
Each customer is an **`org`** row (`org.name` is unique). An org has:
- `category` — `academic` | `company` | `public`/civil
- `plan` — `basic` | `standard` | `premium`
- `evaluation` — string array of evaluation types the org has enabled/run
- `ongoing` — whether an evaluation cycle is active
- `maintenance_model` — whether the Maintenance Model add‑on is unlocked (see §6.4)

### 4.2 Plans (pricing tiers)
Defined in [`app/lib/utils/packages.js`](../app/lib/utils/packages.js) and mapped to Paystack plan codes in
[`app/api/signup/route.ts`](../app/api/signup/route.ts):

| Tier | Package price (kobo) | Paystack plan code |
|---|---|---|
| Basic | 10000 | `PLN_w4hf2tk7k3mu66a` |
| Standard | 20000 | `PLN_pl6nmfsedqvm0oa` |
| Premium | 50000 | `PLN_bquiv8u3t2otwuh` |

> **⚠️ Assumption / open question:** the project form says models are "carefully selected" per
> **category** and grouped into **Basic / Standard / Premium**. **This mapping is not encoded in the
> code** — there is no per‑tier / per‑category model gating table found. Today the tier is essentially
> a billing label. The exact "which models does each (category × tier) unlock" matrix needs to be
> defined. See §9, Q1.

---

## 5. Data model (entities)

41 tables. Grouped by purpose. Every money/score column is `Decimal`; timestamps default to `now()`.

### 5.1 Identity & access
| Table | Purpose | Key fields |
|---|---|---|
| **pesuser** | Every user of the system | `name`, `email` (unique), `password` (bcrypt hash), `role`, `org`, `dept`, `category`, `plan`, `tier` (bronze default), `image`, HR fields (`dob`,`doa`,`poa`,`doc`,`post`,`dopp`,`level`,`faculty_college`), `resettoken`/`resettokenexpiry` for password reset. Unique per `(name, dept, org)`. |
| **org** | Tenant organization | see §4.1 |
| **roles** | Role catalog per org | `name` (PK), `assigned` (count), `org` |
| **permission** | Fine‑grained permission flags per user | `user_id`, `org`, plus boolean‑ish flags: `manage_user`, `access_em`, `ae_all/sub/sel` (access evaluation), `define_performance`, `dp_*`, `access_hierachy`, `manage_review`, `mr_*` |

### 5.2 Evaluation input tables (raw scores captured from staff/HOD)
| Table | Purpose | Key fields |
|---|---|---|
| **appraisal** | Academic staff appraisal (primary) | `pesuser_name`, `org`, `dept`, four quality scores (`teaching_`, `research_`, `administrative_`, `community_quality_evaluation`), `other_relevant_information`, `pending`, `resolve`. Unique per `(pesuser_name, org, dept)`. |
| **counter_appraisal** | **HOD counter‑appraisal** of the same staff (see §6.3) | mirrors `appraisal` scores, `pending` |
| **userperformance** | General performance appraisal | `competence`, `integrity`, `compatibility`, `use_of_resources`, `pending`, `resolve` |
| **counter_userperformance** | HOD counter‑version of userperformance | same four dimensions, `pending` |
| **stress** | Stress expression per staff | `stress_theme`, `stress_feeling_frequency`, `org`, `dept` |
| **counter_stress** | Counter/second stress capture | same + `created_at` |
| **lead_scores** | Aggregated per‑staff performance scores | PK `(pesuser_name, dept)`, four performance dims |
| **performance** | Per‑department performance record | `dept`, `type`, `yield`, `user_id` |
| **facilities** | Facilities register (Maintenance Model input) | `identification_symbol`, `description_of_facility`, `location`, `facility_register_id_no`, `type`, `priority_rating`, `remarks`, `org` |

### 5.3 Evaluation result tables (computed outputs — the "models")
| Table | Model | Notable outputs |
|---|---|---|
| **OptimizationResult** | Staff optimization (queueing/manning) | `optimalK`, `totalStaffNeeded`, staffing breakdown (supervisory / management L1‑2 / top mgmt / lecturers / senior lecturers / professors), model params `D,G,Y,alpha,t1..t4,S0` |
| **StaffEstimation** | Staff‑needed estimation | `methodType`, `staffNeeded`, work‑study params (`basicTime`, `relaxAllowance`, `loadFactor`, `numTasks`, `timePerTask`, `annualManHours`, `standardManHours`…) |
| **personnel_utilization** | Personnel utilization (queue model) | rates `lambda`/`mu`, `kmin/kmax/kstar`, `hstar`, `constraints_ok`, `violations[]` |
| **personnel_redundancy** | Redundancy analysis | `actual_staff`, `optimal_staff`, thresholds, `pr_value`, `rating` |
| **unit_head_overloading** | Unit‑head overload | `actual_hours`, `num_subordinates`, `optimal_hours`, `optimal_k`, `overload_ratio`, `status` |
| **staff_appraisal_results** | Appraisal computation | man‑hours (`cwh`,`cbh`), quality (`oq`,`wq`), `points`, wasted hours/cost, `pidle`, lost cost |
| **stress_scores** | Per‑category stress totals | 10 categories (organizational, student, administrative, teacher, parents, occupational, personal, academic_program, negative_public_attitude, misc) |
| **stress_analysis_results** | Stress ANOVA | `ssto`,`sstr`,`sse`, `f_statistic`, `critical_value`, `conclusion`, df/ms/mean/std |
| **motivation** / **staff_motivation** | Motivation scoring | `total_score`, `rating`, `thresholds` (Json), `categories` (Json) |
| **non_academic_appraisal** | Non‑academic appraisal | `output`,`quality`,`efficiency`,`attendance`,`teamwork`,`total_score`,`rating`,`weights` |
| **performance_result** | Performance scoring | `total_score`,`rating`,`thresholds`,`criteria` |
| **org_structure_results** | Org‑structure ratios | `section`, `result`, `numerator[]`, `denominator[]`, `extra_data` |
| **index** | Composite indices | `redundancy`, `productivity`, `utility` per dept/org |

### 5.4 Surveys
| Table | Purpose |
|---|---|
| **staff_survey_responses** | Staff survey answers (`responses` Json) per user/org/dept |
| **auditor_survey_responses** | Auditor survey answers, one row per (section, question, response) |

### 5.5 Recognition / rewards
| Table | Purpose |
|---|---|
| **hall_of_fame** | Hall of Fame entries (`name`, `title`, `year`, `image_url`) |
| **first_book_of_record** / **second_book_of_record** | Books of record (`name`, `achievement`, `category`, `sub_category`, `date_achieved`) |
| **badges** | Badge catalog (`name`, `category`, `sub_category`, `image_url`) |

### 5.6 External auditors
| Table | Purpose |
|---|---|
| **auditor_responses** | External auditor **registration** — `name`, `email` (unique), `gsm`, `address`, `dob`, `image`, `responses` (Json), `status` (pending/…). This is the pool the **owner** pulls from to invite auditors. |

### 5.7 Billing & subscriptions
| Table | Purpose | Relations |
|---|---|---|
| **plans** | PayPal plan catalog | `paypal_plan_id` (unique), `price_cents`, billing cycle, `trial_days`. → `subscriptions` |
| **subscriptions** | Active subscription per user | `pesuser_id`→pesuser, `plan_id`→plans, `paypal_subscription_id`, `status`, billing timestamps, `failed_payment_count` |
| **subscription_events** | Raw webhook events | `event_type`, `raw_payload` (Json), `processed`, `subscription_id`→subscriptions |
| **subscriptions_info** | Paystack/checkout record | `pesuser_email`, `plan_code`, `reference` (unique), `status`, `amount`, `paid_at`, `expires_at` |

### 5.8 Operational
| Table | Purpose | Relations |
|---|---|---|
| **notifications** | Per‑user notifications | `user_id`→pesuser (FK, cascade), `org`, `title`, `message`, `is_read` |
| **goals** | Staff goals | `name`, `description`, `status`, `day_started`, `due_date`, `user_id`, `dept` |
| **_prisma_migrations** | Prisma migration history | — |

---

## 6. How it connects — business logic & flows

### 6.1 The one rule about "Evaluate/Calculate"
Per the owner: **only** `super-admin` / `admin` (and **HOD, only for the Maintenance Model**) may
press the **Evaluate/Calculate** button. Industrial/Production, departmental admins, HODs (outside
maintenance), and individual staff **must not** trigger calculations — they only **enter data**.
This is a business invariant that must be enforced server‑side, not just in the UI. **🔧 To verify/enforce.**

### 6.2 Onboarding (organization signup)
`POST /api/signup` ([route](../app/api/signup/route.ts)):
1. Receives `name, email, password, org, category, plan, planCode, logo`.
2. Password is **bcrypt‑hashed** (salt rounds 10) before storage.
3. In a transaction: **creates the `org`** (`ON CONFLICT DO NOTHING`), setting
   `maintenance_model = true` automatically **when category is `academic`** (otherwise false).
4. Creates the **admin `pesuser`** for that org and a **`subscriptions_info`** record tied to the plan code.
5. Payment is taken via **Paystack** (plan codes above) / **PayPal**.

> **⚠️ Note:** academic orgs get `maintenance_model` for free at signup, while other categories must
> pay to unlock it (§6.4). Confirm this is intended.

### 6.3 Appraisal + counter‑appraisal reconciliation *(confirmed from code)*
This is the core evaluation‑integrity flow, in [`/api/acceptReject`](../app/api/acceptReject/route.ts):

1. A staff score lands in the **main** table (`appraisal` or `userperformance`).
2. A superior's score for the same staff lands in the **counter** table
   (`counter_appraisal` / `counter_userperformance`) — the code calls it `hodScore`.
3. An admin reviews and **accepts** or **rejects** per section:
   - **Accepted** → main and counter scores are **averaged**, written back to the main table,
     `pending = false`, and the counter row is **deleted**.
   - **Rejected** → both rows are marked `pending = true` for rework.

So a **counter\_** table = the **HOD/supervisor's counter‑evaluation** used to reconcile against the
staff's own/original score. `counter_stress` follows the same "second capture" pattern for stress.
*(This resolves the earlier open question about the counter tables.)*

### 6.4 Maintenance Model *(confirmed from code)*
The Maintenance Model is a **paid add‑on unlocked per org**, driven by Paystack:
- `POST /api/maintenance/initialize` starts a Paystack transaction (amount in Naira → kobo).
- `POST /api/maintenance/verify` verifies the reference and, on success, sets
  `org.maintenance_model = true` (matching the org by name — exact, then `ILIKE`, then payment metadata).
- Academic orgs are granted it at signup (§6.2).

Once unlocked, the **Maintenance** tab opens to HOD/staff/admin roles, and — uniquely — **HODs are
allowed to run** this model's calculation. Given the `facilities` table and the utilization/overloading
result tables, this module is **⚠️ assumed** to cover facilities/asset upkeep + org‑structure/manning
calculations. Exact scope to confirm (§9, Q3).

### 6.5 Subscriptions lifecycle
- **Paystack:** `subscriptions_info` holds the checkout `reference`, `status`, `amount`, `expires_at`.
- **PayPal:** `plans` (catalog) ⇒ `subscriptions` (per user) ⇒ `subscription_events` (webhook audit).
  Webhooks arrive at `/api/paypal-wehook`; capture at `/api/captureByPaypal`.
- Access to the app should be gated on an **active** subscription. The owner flags the
  **subscription check needs securing** and that some pages are currently open without login (§8).

### 6.6 Surveys
- Staff surveys → `staff_survey_responses`; auditor surveys → `auditor_survey_responses`.
- Send/collect via `/api/staff-survey-send`, `/api/survey-response`.
- Owner requirement: the owner should be able to **edit the survey questions** (not yet built/confirmed).

### 6.7 External auditor flow
- Auditors **register** → `auditor_responses` (status `pending`), including consent captured in `responses`.
- The **owner** must be able to **pull registered auditor details** and **send invites** for training or
  deployment to institutions that request an auditor. **Only auditors who consented** to having their
  details pulled should be retained/contactable. *(Owner deliverable — build owner‑side tooling.)*

### 6.8 Recognition / rewards
Computed standings feed manual/automated enrolment into `hall_of_fame`, `first_/second_book_of_record`,
and `badges`, surfaced under `app/hall-of-fame`, `app/book-of-record`, `app/reward` (certificates/badges).
Owner note: these pages are currently **publicly viewable** and should be gated (§8).

### 6.9 Goals
Staff set `goals` with `due_date`; the requirement is that goals + their status are **saved alongside
each evaluation** and **re‑displayed** whenever that evaluation record is recalled.

---

## 7. Relationships & the tenancy‑keying problem  🔧

### 7.1 Real foreign keys (only these exist today)
```
pesuser 1───* notifications        (notifications.user_id → pesuser.id, cascade)
pesuser 1───* subscriptions         (subscriptions.pesuser_id → pesuser.id)
plans   1───* subscriptions         (subscriptions.plan_id → plans.id)
subscriptions 1───* subscription_events
```
Everything else is **not** linked by foreign keys.

### 7.2 Everything else is joined by **string matching** — needs fixing
Almost all evaluation/recognition/survey tables reference the tenant and users by **plain text**:
- `org` stored as the **organization name string** (not `org.id`)
- `dept` as a free‑text department name
- `pesuser_name` / `user_id` / `user_name` as strings (sometimes UUID text, sometimes name)

This is why joins in code use `WHERE LOWER(name) = LOWER(x)` and even `ILIKE '%x%'` fallbacks
(see `/api/maintenance/verify`). Consequences:
- **Data‑isolation risk** — the owner already flagged "one user could pull another organization's data."
  String matching + fuzzy `ILIKE` makes cross‑tenant leakage easy.
- **Integrity risk** — a renamed org or a typo silently orphans rows.
- **Performance** — string joins without proper indexes.

**Recommendation (per owner's instruction to check this thoroughly):**
1. Introduce real FKs: give heavy tables an `org_id INT REFERENCES org(id)` (and `user_id INT REFERENCES pesuser(id)` where a user is meant).
2. Backfill `org_id` from the existing `org` name strings, then keep `org` name as a denormalized display field or drop it.
3. Replace `ILIKE`/name matching in queries with `org_id` equality.
4. Add composite indexes on `(org_id, dept)` where filtered.
This is a **migration project**; it directly closes the cross‑tenant data‑leak finding in §8.

---

## 8. Known problems / security posture (owner‑reported + code‑observed)

| Area | Issue | Severity |
|---|---|---|
| Login | System can be tricked into accepting fake logins (JWT/verification weakness) | Serious |
| Data pages | One org can pull another org's data (see §7.2 string keying) | Serious |
| User accounts | Password information can be exposed | Serious |
| API | **SQL injection** — several routes use `$queryRawUnsafe` with string‑interpolated user input (e.g. `acceptReject`, `counterAppraisal`) | Serious |
| Public pages | Hall of Fame & subscription check open without login | Serious |
| Results | Evaluations are saved but **cannot be viewed/charted afterwards** (top deliverable) | Must‑fix |
| Hashing | Confirm bcrypt hashing is applied **everywhere** credentials are set | To verify |
| Data at rest | Generated + computed data must be "well secured" | To verify |

> **Immediate code‑level flags:** parameterize every `$queryRawUnsafe` (use Prisma parameters or
> `$queryRaw` tagged templates), add auth to public routes, and enforce role checks server‑side (§6.1).

---

## 9. Open questions for the owner

1. **Model → (category × plan) matrix.** Which evaluation models does each org **category**
   (Academic / Company / Public) get, and how do **Basic / Standard / Premium** further gate them?
   *Not encoded in code today.* (Owner: currently unknown — to be defined.)
2. **Role canon.** Confirm the seven roles in §3 and retire legacy strings (`prod`, plain `admin`, `staff`).
3. **Maintenance Model scope.** Confirm it covers facilities + org‑structure/manning calculations, and
   that HOD‑run‑only + academic‑free‑unlock are intended.
4. **Owner console.** Confirm the owner needs a dedicated cross‑org area for: pulling consented auditor
   registrations, sending auditor invites, and broadcasting "update" tickers to super‑admins.
5. **Survey editing.** Confirm the owner should be able to edit survey questions in‑app.

---

## 10. What "done" looks like (owner's acceptance criteria)
- Track **and download** past evaluation results; owner can access DB data.
- Maintenance Model functions as designed.
- Analysis re‑run passes; Dr. Omoregbee Henry signs off.
- Target timeline: **1–2 months** (per the analysis document).
- Scope note: completion is measured **on the local system**; cloud deployment is the owner's
  responsibility and outside this contract.
