# PES — Portfolio Project Profile

Generated from a full codebase audit per `PROJECT_EXTRACTION_PROMPT.md`, dated 2026-09-10.

## 1. Project Profile

```typescript
const pesProject: Project = {
  id: "pes",
  title: "PES",
  slug: "pes",
  category: "Fullstack",
  featured: true,
  shortDescription:
    "Universities and companies ran staff appraisals, stress surveys, and staffing math on spreadsheets that nobody trusted after the fact; PES turns those into one system where a score can be traced back to the person who entered it.",
  longDescription:
    "A university department head or company HR admin who wants to know whether a team is overstaffed, understaffed, or burning out has historically had to run separate spreadsheets for appraisal scores, stress surveys, and staffing formulas, then reconcile them by hand before anyone signs off. PES puts appraisal, performance, stress evaluation, and workforce-sizing models (queueing-theory personnel utilization, ANOVA-based stress analysis, staff-number estimation) behind one role-gated workflow: a staff member enters a score, their supervisor enters a counter-score for the same period, and an admin accepts or rejects the pair, which either averages them into a final record or sends both back for rework. The models themselves are the part a generic HR tool can't fake: they encode named equations (K*/H* queueing outputs, ANOVA F-statistics with a documented reset rule, load-classification tables) with inline guidance so a non-statistician can run them and still trust the number. It's built multi-tenant so one Postgres database serves many organizations at once, each seeing only its own roster and results, with subscription tiers (Paystack and PayPal) gating which models an organization can run.",
  techStack: [
    "Next.js 14 (App Router)", "React 18", "TypeScript", "PostgreSQL", "Prisma 5",
    "Redux Toolkit", "Formik / react-hook-form", "Zod", "Tailwind CSS v4",
    "Radix UI / shadcn-style component kit", "JWT (jsonwebtoken) + bcrypt",
    "Paystack", "PayPal Subscriptions API", "Stripe (present, inactive billing path)",
    "Cloudinary", "Nodemailer / Resend", "Docker Compose", "Vercel", "Neon",
  ],
  coverImage: "/projects/pes/cover.png",
  liveUrl: "https://hooaij.com/performance-evaluation-software/",
  architecture: {
    description:
      "Next.js App Router serves both the UI and roughly 200 API route handlers. Identity is established per-request through a verified JWT claim, and the organization a query is scoped to comes only from that verified token, never from the request body or URL — a rule the codebase enforces with a documented grep audit because it had been broken repeatedly by routes that looked correctly scoped but weren't. Most of the ~40 evaluation, appraisal, and recognition tables key their tenant by a plain-text organization name string rather than a foreign key, documented as the largest structural debt in the schema and slated for an org_id backfill before any real customer onboards. The Prisma schema declares 62 models but only 11 have real migration files — the rest were pushed directly to the database — so new schema changes are hand-written and applied with db execute plus migrate resolve --applied until the history is baselined. Billing runs two parallel schemes for historical reasons: a flat Paystack-shaped table that signup actually writes to, and a relational PayPal-shaped set the UI doesn't call yet, with a single catalog file now the intended source of truth for prices and entitlements.",
  },
  engineeringDecisions: [
    {
      topic: "Authorization identity source",
      decision: "Every API route resolves the caller's organization from a server-verified JWT claim, never from the request body or a URL parameter.",
      reason: "An organization's appraisal and stress data is confidential inside a university or company; a rule that looked right but let the org come from something the caller controlled would let anyone read or write another tenant's staff records by editing a request. A prior audit found exactly that pattern across a dozen-plus routes, including three 'fixed' in a commit titled to prevent that leakage and still leaking afterward.",
      tradeoff: "Every new route needs a few extra lines of guard code and a mental check AGENTS.md now spells out explicitly. Accepted because the cost of getting it wrong is a cross-tenant data leak, not a slow API.",
    },
    {
      topic: "Counter-score reconciliation instead of single-entry scoring",
      decision: "Every appraisal and performance score is captured twice — staff, then supervisor as a counter-score — and an admin explicitly accepts (averaging) or rejects (sending both back).",
      reason: "A single self-reported or single supervisor-reported score is easy to dispute after the fact. Two independent entries plus an explicit admin adjudication step means a contested score has a paper trail: who entered what, who signed off.",
      tradeoff: "Roughly doubles data-entry burden and adds a review queue. Acceptable where evaluation outcomes affect pay or continued employment and need to survive a challenge.",
    },
    {
      topic: "Multi-tenancy keyed by organization name string, not a foreign key",
      decision: "Roughly 37 tables carry an org column as free text rather than an org_id foreign key.",
      reason: "This shipped in the original codebase before the current maintainers took over; rewriting all 37 tables' join keys mid-build would have blocked every other fix behind a schema migration touching the entire query surface. Shipping security and correctness fixes on the existing shape first got real bugs closed faster.",
      tradeoff: "Until the migration runs, an organization can't be renamed without orphaning rows, and a typo'd org name silently creates unjoinable data. Documented as a pre-launch blocker, scheduled before any real organization's data is at stake.",
    },
    {
      topic: "Two billing schemes running in parallel",
      decision: "Kept the Paystack-shaped table signup actually writes and the PayPal-shaped relational set, while consolidating pricing and entitlement logic into one catalog file.",
      reason: "Four different places in the codebase quoted different prices for the same plan before this was cleaned up, and signup wrote status: 'success' without checking money had moved. Centralizing on one catalog closes the disagreement.",
      tradeoff: "The two schemes still coexist and only one is wired to the live signup path, leaving the other as dead weight until someone migrates or drops it. Left as an open decision, per the project's own documentation.",
    },
  ],
  metrics: [
    {
      label: "Authorization coverage closed from a near-total gap",
      value: "59 of 199 routes with zero identity check, down to a documented, audited pattern across all of them",
      description: "A September 2026 audit found handlers including one that returned every user's bcrypt password hash to any caller, and one that let anyone cancel any organization's subscription by address; every handler now establishes verified identity before its first database call.",
    },
    {
      label: "SQL injection surface reduced from systemic to one fixed string",
      value: "45+ raw, string-interpolated queries down to 1 hardcoded, input-free statement",
      description: "$queryRawUnsafe with request data spliced directly into SQL appeared in over 45 places, including stress and performance-scoring routes; nearly all replaced with parameterized Prisma calls.",
    },
    {
      label: "A committed database dump with working plaintext credentials, purged and rotated",
      value: "backup.sql (3,149 lines, 24 staff records, 18 plaintext passwords) removed from team history; all exposed passwords rotated",
      description: "The dump was tracked on GitHub for four months while the login route accepted plaintext matches, so these were live credentials. The team's own remote had history rewritten; the client's separate upstream fork still carries the same history, flagged but unresolved.",
    },
    {
      label: "\"Write-only\" evaluation results made readable",
      value: "86 route files gained a GET handler that previously had none",
      description: "The client's top recorded complaint was that running an evaluation saved a result nobody could look at again; personnel utilization, redundancy, staff number, org structure, stress, and performance results now have dedicated history pages.",
    },
  ],
  futureImprovements: [
    "Backfill the 37 name-keyed tables onto a real org_id foreign key so renaming an organization can't silently orphan its own records.",
    "Wire the plan catalog's entitlement check into the actual route guards; a basic-tier user who knows a model's URL can currently reach it anyway.",
    "Fill the three still-missing catalog prices and flip billing enforcement on, since signup can currently complete without a real payment reference while the client finishes testing.",
    "Extend Zod validation past the 18 routes that currently have it (of roughly 205), so malformed requests fail with a field error instead of a raw database exception.",
  ],
  dateStr: "2026-09-10",
};
```

## 2. Media Asset Checklist

1. **Appraisal counter-score reconciliation screen** — staff score and supervisor counter-score side by side with accept/reject. The single clearest proof of the trust mechanism.
2. **A model history page after a real run** (personnel utilization or stress ANOVA) — the "write-only became readable" fix, the client's own top complaint.
3. **A disabled control with its inline explanation visible** — concrete evidence of the "controls explain themselves" design rule.
4. **Org-scoped roster view**, ideally two organizations that clearly don't overlap, to make the multi-tenant claim visible.
5. **Mobile view of a staff data-entry form** — most users are staff on phones, not admins on desktop; a desktop-only set would misrepresent that.
6. **The plan/pricing selection screen** — the only place the subscription-gating decision is visible in the UI.

No demo video exists; a 30–60s recording of appraisal → counter-appraisal → accept would be the highest-value one to make.

## 3. Marketing & Social Proof Gap Report

- **Client identity**: A real name — Dr. Omoregbee Henry Ogbemudia — and a brand reference (RANDORA, hooaij.com) appear in the docs and git history, but nothing here is a permission grant. Need: confirm the name/spelling is correct, and explicit permission to publish it.
- **Permission to use name/brand**: Not confirmed anywhere in the repo. Needs a direct ask.
- **Testimonial**: One usable source exists — informal but genuine client feedback in `My Feedback on the updated software_111104.docx` — but it reads as itemized bug feedback, not a publishable quote. 15 other client .docx files weren't individually opened and may contain more. Suggested ask: *"Could you share one or two sentences on what's changed for your team now that appraisal results are viewable and traceable, that I can quote in a case study?"*
- **Named contact for future quote**: Likely Dr. Omoregbee, unconfirmed.
- **Usage/adoption numbers**: None exist — `AGENTS.md` states explicitly the app hasn't launched and has no real customers or production data. Don't invent; ask if a pipeline number exists outside the repo.
- **Before/after comparison**: Strong internal source (`FLAWS.md`, the security audit) documents specific dated complaints. Missing: the client's own words on what existed *before* PES — prior tool, spreadsheet, or nothing.
- **Case study depth eligibility**: Qualifies for a real case study now, anonymized ("a workforce-evaluation platform built for a Nigerian client..."), upgradable to named once permission and a polished quote come through. No need to wait on that to start writing.
