# PES — security & architecture re-audit

Re-run of *PES Software Analysis (Exhaustive Project Analysis)* against the
codebase as it stands on branch `dev`, 1 Sep 2026. Each of the report's claims is
marked **Fixed**, **Partly fixed**, or **Still open**, followed by findings the
original report did not have.

## Verdict on the original report

| # | Claim | Status |
|---|-------|--------|
| 1 | "Write-only black hole" — no GET routes, no way to read persisted model data | **Fixed** |
| 2 | Hall of Fame / Book of Records unauthenticated | **Still open** |
| 3 | Paystack webhook HMAC-verified | **Confirmed good** |
| 3 | `/api/subscriptions/active` takes email from query string, no auth | **Fixed** |
| 4 | `app/(hod)` does not exist | **Still true** (by design — no HOD zone) |
| 4 | IDOR: `getStats` trusts an org string from the request body | **Fixed** |
| 5 | `app/middleware.ts` ignored by Next.js | **Fixed** |
| 5 | Fake JWT verification (`jwt.decode` instead of `jwt.verify`) | **Partly fixed** |
| 5 | 45+ `$queryRawUnsafe` SQL-injection sites | **Fixed** |
| 5 | `/api/getUsers` returns password hashes | **Fixed there, moved elsewhere** |
| 6 | Purge `backup.sql` from Git history | **Still open** |

### 1. Black hole — fixed
`personnelUtilization`, `orgStructure`, `supervisionCost`, `workSampling/studies`
now expose GET; 86 route files export a GET handler. Every major model has a
history page under `app/(admin)/models/*/history/` (utilization, redundancy,
productivity, utility index, staff number, org structure, student–teacher,
performance, stress, supervision cost), backed by `HistoryPicker.tsx` and
`RemoveRecordButton.tsx` + `/api/model-history` for deleting a bad run. Runs are
read back and fed to the future-requirement extrapolation. This phase is done.

### 5. Middleware — fixed
`middleware.ts` now sits at the repo root, so Next.js loads it, with a real
`config.matcher` over `/goals`, `/appraisal`, `/performance`, `/models`, etc. It
gates *pages* by effective role from a cookie. Note it is **not** an API
authenticator — API protection comes from `app/api/_lib/authGuard.ts`
(`authorize` / `verifyToken` / `tokenFromRequest`), used by 84 route files, plus
`viewerFrom()` in `performance-v2/_auth.ts` and `appraisal-v2/_auth.ts`, both of
which call `jwt.verify` and derive org scope from a verified claim.

### 5. SQL injection — fixed
`$queryRawUnsafe` / `$executeRawUnsafe` is down from 45+ to **4 occurrences in 2
files**: `app/api/runMigration/route.ts` (three hardcoded `ALTER TABLE` strings,
no user input) and `app/api/saveStressScores/route.ts`. Neither interpolates
request data. Everything else moved to Prisma delegates or tagged `$queryRaw`.

### 5. `jwt.decode` — partly fixed
114 `jwt.decode`/`jwtDecode` call sites remain, but the character has changed:
almost all are **client components** reading their own token for display
(`navbar`, `sidebar`, `usePermissions`, certificates, `useOrgCategory`), which is
fine. The ones that still matter are server routes that trust an unverified
token for org scoping:

- `app/api/getDataScores/route.ts:13`
- `app/api/getPerformanceResult/route.ts:21`
- `app/api/assign-prod/route.ts:13`
- `app/lib/jwt.ts:58,100`

An attacker forges `{"org":"Victim Org"}`, base64s it, and reads that org's data.

## Findings the original report missed

### CRITICAL — the `/api/admin/*` routes have no authentication at all
Six routes under `app/api/admin/` skip every guard:

- `admin/users-by-org` — `prisma.pesuser.findMany()` with **no `select`**, every
  user in **every organisation**, including the bcrypt `password` column. This is
  the "getUsers leaks hashes" bug from the report, relocated and made worse
  (cross-tenant instead of single-tenant).
- `admin/all-auditors` — same, filtered to auditors, full rows.
- `admin/orgs/[org]/users` — full rows for any org named in the URL.
- `admin/users/[id]` — **unauthenticated `DELETE`** of any user by id, and GET of
  their full record.
- `admin/auditors` — GET all auditor responses; POST approves/rejects and sends
  mail.
- `admin/orgs/[org]/auditors`.

Anyone who can reach the deployment can enumerate and delete users.

### CRITICAL — `/api/admin/login` signs tokens with the hardcoded secret `'oti'`
`app/api/admin/login/route.ts:70`. Two consequences: the secret is in the repo,
and the token doesn't verify against `JWT_SECRET`, so every guarded route rejects
it. There is also no `expiresIn`, and no check that the account is actually an
admin — any valid credentials get an "admin" token. This route looks abandoned;
deleting it is likely the right fix.

### HIGH — the `fallback-secret-change-in-production` default
Thirteen files sign or verify with `process.env.JWT_SECRET || 'fallback-secret-…'`.
`JWT_SECRET` *is* set in `.env.local` and `.env.production.local`, so this is not
currently exploitable — but a single misconfigured environment silently downgrades
the whole app to a publicly-known signing key. `app/lib/jwt.ts:27` already throws
on the fallback; the other twelve should call that helper instead of inlining
the `||`.

### HIGH — 66 API routes still have no authentication
Beyond the admin group, the ones that leak or mutate real data:

- `org/[org]` — org config and stress-cycle timing for any org, by name.
- `getStressData`, `getAllDataScores`, `getAppraisalData`, `getAppraisalByDept`,
  `getStress`, `getStressEvaluation`, `counterStress`, `counterAppraisal`,
  `counterTotals`, `getNonAcademicAppraisal`, `appraisal` — cross-org aggregates
  with no org filter at all (`getStressData` groups the whole `stress` table).
- `hall-of-fame`, `first-book-api/*`, `second-book-api/*` — as the report said,
  still open. Lowest severity here: the data is meant to be celebratory.
- `saveStress`, `saveLeadScores`, `saveAuditorAppraisal`, `addPersonnelIndex`,
  `addRoles`, `hod-assign`, `unitHead`, `evaluate`, `orgStructure`,
  `personnelRedundancy`, `stress-analysis`, `workSampling/positions`,
  `workSampling/observations` — **unauthenticated writes**. Anyone can inject
  model inputs or reassign a HOD.
- `staff-survey-send`, `send-email`, `resendCredentials` — unauthenticated mail
  sending; an open relay for spam through your Gmail credentials.
- `subscriptions/upgrade`, `paystack/upgrade`, `paystack/subscribe`,
  `subByPaypal`, `captureByPaypal` — billing mutations. The webhooks are
  correctly signature-verified; these siblings are not.
- `debugGoals`, `swagger` — debug/introspection surface, should not ship.

### HIGH — `/api/runMigration` runs DDL over an unauthenticated GET
`app/api/runMigration/route.ts` alters `WorkSamplingStudy` on any GET. Harmless
today (idempotent `ADD COLUMN IF NOT EXISTS`), but it is a publicly-callable DDL
endpoint, and it contradicts the migrations policy in `CLAUDE.md`. Delete it.

### MEDIUM — `changePassword` is an unauthenticated password oracle
`app/api/changePassword` requires the current password, so it is not a takeover
primitive, but with no auth and no rate limiting it is an offline-quality
brute-force endpoint against any known email. The rate-limiting the old
`app/middleware.ts` claimed to do does not exist in the root middleware.

### MEDIUM — plaintext password fallback in both login routes
`app/api/login/route.ts:42` and `admin/login`: if the stored hash doesn't start
with `$2a/$2b/$2y`, the code falls back to `password === user.password`. Legacy
plaintext rows are still accepted. Migrate and remove the branch.

### MEDIUM — path traversal in `/api/downloads/[filename]`
`app/api/downloads/[filename]/route.ts` interpolates the segment straight into
`public/downloadables/${filename}` with no `path.resolve` containment check.
Next.js normalises most `..` in path segments, but encoded variants and the
absent containment check make this worth fixing properly. (It also returns the
buffer as JSON, so the download is broken anyway.)

### MEDIUM — `backup.sql` is still committed
89 KB, 3149 lines, tracked, containing `COPY` data for `pesuser`, `appraisal`,
`goals`, `org`, `performance`, `motivation` and ~25 other tables, plus two bcrypt
hashes. Present in history at `f4aa87e` and `40b1c1e`. `pes_schema.sql` and
`DATABASE_MIGRATION.sql` are also tracked. Remove from the index and purge from
history; rotate anything the dump exposes.

### LOW — Zod coverage
Only 12 of 205 route files import the validation layer. Phase 3's "enforce Zod on
all POST routes" is essentially untouched.

## Remediation status

**Done (1 Sep 2026, priority 1):**

- `app/api/runMigration/route.ts` **deleted**.
- `app/api/admin/login` — no longer signs with `'oti'`; uses `JWT_SECRET` (500s if
  unset), adds `expiresIn: '15m'`, drops the plaintext-password fallback, and
  refuses accounts that are not `super-admin`/`admin`. It is **not** deleted: it
  is the login for the platform console at `app/admin/`.
- `admin/users-by-org`, `admin/all-auditors`, `admin/orgs/[org]/users`,
  `admin/orgs/[org]/auditors`, `admin/users/[id]` (GET **and** DELETE) — now
  authenticated and **org-scoped** via `app/api/admin/_scope.ts`. A first pass
  gated them to `super-admin` outright; a role census showed **no account holds
  that tier** (locally: `admin: 4`, `hod`, `lecturer`, `unit-head`,
  `industrial-engineer`, `dept-admin`, plus one free-text `Super user`), so that
  would have 403'd the console for everyone. `consoleViewer()` now separates the
  two tiers: `super-admin` (platform operator) reads across organizations, `admin`
  (organization admin) is confined to their own `org` claim. `orgs/[org]/*` refuse
  an org that is not the caller's; `users/[id]` resolves the target's org before
  reading or deleting and answers **404, not 403**, across a tenant boundary.
  `users/[id]` also validates the id is an integer, and uses `delete` not
  `deleteMany`.

  **`super-admin` and `admin` are not the same tier** — see
  `app/components/utils/roles.ts:11`. The `Super user` row is a display label, not
  the tier, and grants nothing. Cross-org console views (`/admin/organizations`,
  `/admin/auditor`) will stay empty-ish for an org admin until a real
  `super-admin` account exists.
- Every `pesuser` read in those routes now has an explicit `select` that omits
  `password`, `resettoken` and `resettokenexpiry`.
- `admin/auditors` GET/POST — gated to `super-admin`/`admin` (POST creates a user
  and mails credentials), and the created account's `default_password` is now
  bcrypt-hashed instead of stored verbatim.

**Done (priority 2, commits f51e439 / 714afbc / 234d85d / 49eb7ab):**

All 59 unguarded handlers are closed. `grep -rLE 'authorize\(|verifyToken\(|
tokenFromRequest\(|viewerFrom\(|consoleViewer\(|jwt.verify\(|Deliberately
public' app/api --include=route.ts` now returns nothing, and no server-side
`jwtDecode` remains in `app/api/`.

- **Account takeover / lockout:** `resendCredentials` reset any account's
  password by email address, unauthenticated. `changePassword` was an
  unrate-limited password oracle. `send-email` was an open relay issuing auditor
  invites signed with the repo's fallback secret.
- **Cross-tenant reads:** `appraisal`, `counterAppraisal`, `getStress`,
  `counterStress` had no org clause at all; `getStressData` / `getAppraisalData`
  grouped whole tables; `getInventory`, `getAppraisalByDept`, `org/[org]`,
  `orgs`, `achievements` took the scope from the request. `orgs` leaked the name
  of every tenant.
- **Unverified tokens:** `getDataScores`, `getAllDataScores`,
  `getPerformanceResult`, `getNonAcademicAppraisal`, `getStressEvaluation`,
  `orgStructure`, `saveAuditorAppraisal`, `assign-admin`, `assign-hod`,
  `assign-prod`, `getFlaggedScores`, `nonAcademicAppraisal`,
  `survey-response/auditor` — all scoped by an org read with `jwtDecode`.
- **Unauthenticated writes:** `saveStress`, `saveLeadScores`, `unitHead`,
  `addRoles`, `addPersonnelIndex`, `personnelRedundancy`, `stress-analysis`,
  `counterTotals`, and the whole of `workSampling` (studies, positions,
  observations — including DELETE).
- **Billing:** `subscriptions/upgrade`, `paystack/upgrade`, `paystack/subscribe`,
  `paypal/subscribe`, `subByPaypal`, `captureByPaypal` all acted on an account
  named in the body.
- **Secrets:** `getJWTSecret()` / `getRefreshSecret()` now **throw** on a missing
  or placeholder value; all 12 inline `|| 'fallback-secret-…'` sites go through
  them. `admin/login` no longer signs with `'oti'`.
- **Passwords:** the plaintext-comparison branch in `/api/login` stays (rows like
  that still exist) but a plaintext match is now re-hashed on the spot, so each
  such login drains one.
- **Deleted:** `runMigration`, `debugGoals`, `swagger`, `staff-survey-send`,
  `hod-assign`, `evaluate`, `pModel`. Per-request `ALTER TABLE` removed from both
  `workSampling/studies` files.
- **Path traversal:** `downloads/[filename]` is resolved and containment-checked,
  and now returns bytes rather than a JSON object of byte indices — that download
  had never worked.
- **AGENTS.md** gains an "API route security constraints" section with the rules,
  the correct patterns, and the audit greps to run before finishing any task that
  touched `app/api/`.

## Remaining priority

1. ~~admin routes~~ — done.
2. ~~the 59 unguarded routes~~ — done.
3. **This week** — auth + org scoping on the 66 unguarded routes, starting with
   the unauthenticated writes and the mail senders; replace the four server-side
   `jwtDecode` scoping calls with `verifyToken`.
4. ~~rate limiting, Zod on the model writes, the dumps, super-admin~~ — done
   (commit `51e0033`):

   - **Rate limiting** (`app/api/_lib/rateLimit.ts`): `login` and `admin/login`
     at 10/min per address and 5/min per account; `resetPassword` 5/min and
     3 per 15 min per address; `changePassword` 5/min per account;
     `resendCredentials` and the auditor invite 20/hr per org; `signup` 5/hr;
     the two public survey forms 10/hr and 5/hr. The counter is per-process, so
     on Vercel a burst spread across instances gets more than the numbers
     suggest — documented at the top of the file, with Redis as the fix when
     there is somewhere shared to put it.
   - **Zod** on the model writes: `personnelRedundancy`, `stress-analysis`,
     `unitHead`, `counterTotals`, `saveLeadScores`, `workSampling/positions`,
     `workSampling/observations`. No schema accepts `org`.
   - **Dumps untracked**: `backup.sql`, `pes_schema.sql`, `DATABASE_MIGRATION.sql`,
     `queries.sql`, `script.sql`; `*.sql` ignored except under `prisma/`.
   - **`scripts/promote-super-admin.ts`** grants the platform tier — a script, not
     a route, because the tier that reads every org should not be reachable over
     HTTP.
   - **`npm run db:push` refuses**, pointing at CLAUDE.md.

## The one thing not done

**Purging the dumps from Git history**, and rotating what they expose. Untracking
does not remove them: `backup.sql` is still fully readable at `f4aa87e` and
`40b1c1e`, including 22 email addresses, 2 bcrypt hashes and at least one
plaintext password that still works.

The rewrite is prepared and verified in `docs/purge-backup-sql.md`. It is not run
because `--force --mirror` rewrites every SHA on a 209-commit branch that another
session was committing to during this audit, on a repository the client also
holds as `origin`. That needs a window agreed with the people holding clones, not
a unilateral force-push.

**The credential rotation in that document should happen regardless** — it does
not depend on the rewrite, and the dump has already been cloneable for months.

The report's phases 1 (black hole) and 3 (SQL injection) are effectively complete.
Phase 2 was done for the routes the report named specifically, but the same class
of bug survives in bulk in the routes it did not enumerate — that is where the
remaining risk is concentrated.


---

## Verified in production, 4 Sep 2026

Production had not deployed since 2 Sep 21:21 — twelve consecutive failed
builds. Cause was not the security work itself but a file-trace artifact:
`/api-doc` called `next-swagger-doc`, whose build-time glob made Next write a
trace listing `../../../export-detail.json`, a path that has never existed.
Vercel lstats every traced file. Deleting `/api-doc` (unreferenced, and it
published the whole API surface) fixed it. Separately, 122 authenticated route
handlers now declare `dynamic = 'force-dynamic'`, which cleared the
`Dynamic server usage` errors the guards had introduced.

Deployment `a7tcz4cgm` is Ready. Probed at
`https://professional-evaluation-software.vercel.app`:

| check | before | now |
|---|---|---|
| `GET /` | — | `200` |
| `POST /api/login`, wrong password | — | `401 Invalid credentials` (not 500 — the secrets resolve) |
| `POST /api/refresh`, no cookie | — | `401 No refresh token provided` |
| `GET /api/admin/users-by-org` | every user in every org **with password hashes** | `401 Unauthorized` |
| `GET /api/orgs` | every tenant name | `401 Unauthorized` |
| `GET /api/getStressData` | cross-tenant aggregate | `401 Unauthorized` |
| `GET /api-doc` | full API surface | `404` |
| 12 rapid login attempts | all processed | `429` from the 7th |

The 401/429 interleaving on the last row is the per-process counter behaving
exactly as documented in `app/api/_lib/rateLimit.ts`: each serverless instance
keeps its own tally. Redis when there is somewhere shared to put it.
