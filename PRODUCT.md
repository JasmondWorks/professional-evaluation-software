# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are staff and administrators inside universities and organizations that run formal performance evaluation:

- **Industrial engineers / analysts** — run the mathematical models (personnel utilization, staff-number determination, student-teacher, productivity/redundancy indices, stress) and interpret results.
- **HR / admin & super-admin** — manage the employee roster, assessments, subscriptions, roles/permissions, and organization setup.
- **HODs / unit heads** — score and approve their department/faculty (e.g. stress approvals, counter scores).
- **Lecturers / employees / auditors** — submit data-entry forms (stress instrument, performance), set goals, view their own results and rewards.

Most users are staff completing forms and checking results, and they are **mobile-first**. Admins and analysts work longer desktop sessions but are the minority of the user base. The shell must be genuinely responsive and thumb-friendly, not desktop-only.

## Product Purpose

PES (Professional/Performance Evaluation Software) is a role-based SaaS that operationalizes operations-research and HR mathematical models for workforce evaluation. Organizations use it to determine required staff numbers, measure personnel utilization/productivity/redundancy, run structured stress and performance appraisals, set and track goals, and recognize top performers. Success = an organization can go from raw workforce data to defensible, model-backed evaluation decisions inside one system, scoped strictly per organization.

## Positioning

Not a generic HR admin dashboard: PES encodes specific quantitative models (queuing-theory personnel utilization with K*/H* outputs, staff-number methods, ANOVA-based stress evaluation with faculty/organization aggregation) with domain guidance (inline PDF guides, per-parameter explanations, constraint validators tied to named equations). The differentiator a neighbor could not copy is this math-literate evaluation engine plus its role/approval workflow, not the surrounding CRUD.

## Operating Context

- Multi-tenant: every query is org-scoped; no data leaks between organizations. Staff counts/listings are a single source of truth (the org-scoped `pesuser` roster) and must be identical across pages.
- Role- and permission-gated navigation (JWT-driven); different roles see different tabs and surfaces.
- Workflow gates: model runs, approvals (e.g. "Approve entire division"), and report generation are blocked until prerequisites are met, and disabled controls must always state why on screen.
- Stress evaluation runs in cycles governed by an effective settings cycle; data must never mix across cycles. Faculty stress = mean of departments; organization stress = mean of faculties (see project memory `stress-eval-rules`).
- Subscription-tiered (Paystack/PayPal): product category (public/company/academic) × plan (basic/standard/premium) determines which models are available.

## Capabilities and Constraints

- Next.js 14 (App Router), React 18, Tailwind, Prisma/PostgreSQL, Redux Toolkit, Formik/react-hook-form, sonner toasts, iconsax + lucide icons, apexcharts/recharts.
- Mathematical models with parameter forms, validators, and result cards; history views per model.
- Employee database with roles/permissions, assessment & performance review flows, goals, gamification (Hall of Fame, Book of Records, certificates/badges), maintenance model.
- Known product gaps (documented, not to fabricate around): several models are "write-only" — results persist but have no retrieval/reporting UI yet; some GET endpoints lack auth. These are real limitations; do not present them as working features.

## Brand Commitments

- Name: **PES**. Existing brand color is a deep indigo `#322b80`; the redesign keeps indigo as the anchor and systematizes it into a proper ramp (user-confirmed).
- Desired character: **institutional & trustworthy** — calm, authoritative, credible for HR/evaluation decisions (user-confirmed).
- Per-organization logo is shown in the shell when present.
- **Visual direction (user-chosen standing preference):** the refined institutional-dashboard convention, executed straight at high fidelity — no metaphor, no irony. Craft bar: **Linear** (precise, restrained color, tight type scale, keyboard-first, immaculate spacing and states). Systematized indigo `#322b80`, neutral scale, accessible contrast, mobile-first.

## Evidence on Hand

- Real domain content exists: named models with descriptions, inline PDF guides (`/relax.pdf`, load-classification tables), the stress instrument, role/permission definitions, subscription plan configs. Use real model names and copy.
- No real customer names, testimonials, benchmarks, or pricing claims should be invented. Subscription tiers exist but specific commercial claims must not be fabricated.

## Product Principles

1. **Org isolation is sacred** — every surface is scoped to one organization; counts and rosters are one source of truth.
2. **Explain the gate** — any disabled/blocked control states why and how to unblock, on screen.
3. **Math made legible** — heavy quantitative models are made usable through grouping, inline guidance, and constraint feedback, not by hiding the rigor.
4. **Role-true surfaces** — users only see what their role/permissions allow; the UI adapts per role.
5. **Mobile-first for staff** — the majority complete forms and check results on phones; ergonomics on small screens are first-class.

## Accessibility & Inclusion

No formal standard was established, but the current build has real gaps to fix in the redesign: low-contrast navigation text, color-only role encoding, inputs without label associations, near-absent ARIA, and body text that fights user font scaling. Target WCAG AA contrast and proper labeling as part of the foundation.
