# PES Software — Full Codebase Analysis

---

## 1. What Do I Think of the Project?

**PES (Performance Evaluation Software)** is an ambitious, domain-specific HR/performance management platform targeting organisations (particularly academic institutions and industrial enterprises). It covers:

- **Employee performance appraisals** (self-evaluation + HOD counter-appraisal)
- **Stress assessment** with statistical analysis (ANOVA)
- **Goal setting and tracking**
- **Personnel utilization & redundancy modelling** (operations research–style optimization)
- **Work sampling studies**
- **Staff estimation** (multiple methods)
- **Org structure analysis**
- **Maintenance model** (for industrial orgs)
- **Subscription/payment** (Paystack + PayPal)
- **Role-based access control** (super-admin, admin, HOD, lecturer, employee, auditor)
- **Hall of fame, book of records, badges** (gamification)

> [!IMPORTANT]
> This is a **real, non-trivial SaaS product** with genuine domain complexity. The feature set is substantial and the business logic (mathematical models, scoring algorithms, etc.) represents genuine IP. It's not a toy project — it has real paying users, payment integration, and multi-tenant design.

**Verdict**: An impressive scope for a product-stage application. The concept is solid and the domain is underserved. However, the **execution** has significant gaps that need addressing before it can be considered production-grade.

---

## 2. What Do I Think of the Codebase?

### The Good

| Aspect | Assessment |
|--------|-----------|
| **Framework choice** | Next.js 14 (App Router) with TypeScript — solid, modern choice |
| **Database** | PostgreSQL with Prisma — well-chosen stack |
| **Schema** | Comprehensive (640 lines), well-organized with proper indices and constraints |
| **Recent security fixes** | JWT secret moved to env, parameterized queries added to some routes, Zod validation schemas created |
| **Auth utilities** | SSR-safe localStorage helpers, centralized JWT library |
| **Password handling** | bcrypt hashing, password reset with expiring tokens |

### The Problematic

| Aspect | Issue |
|--------|-------|
| **Architecture** | No clear separation of concerns — API routes are monolithic, mixing validation, business logic, and data access |
| **Consistency** | Wildly inconsistent patterns across 96+ API routes. Some use Prisma ORM, many use `$queryRawUnsafe`, some use `$queryRaw` |
| **Dead code** | Massive commented-out blocks (e.g., [layout.tsx](file:///d:/work/pes-software/app/layout.tsx) has 28 lines of commented-out code) |
| **Type safety** | Heavy use of `any` types throughout. TypeScript is present but barely leveraged |
| **Duplicate dependencies** | Both `bcrypt` and `bcryptjs` in package.json, both `formik` + `react-hook-form` + `yup` + `zod` for forms/validation |
| **No tests** | Zero test files found. No testing framework configured |
| **No error boundaries** | No React error boundaries anywhere |
| **Console logging** | 50+ `console.log` statements across API routes, including **logging tokens and passwords** |

---

## 3. Do I Understand the Aim?

**Yes, clearly.** This is a **multi-tenant Performance Evaluation SaaS** where:

1. **Admins** sign up, create their org, pick a subscription plan, and add employees
2. **HODs** oversee departments, counter-evaluate staff appraisals
3. **Employees/Lecturers** fill in self-appraisals, stress assessments, performance data
4. **Auditors** conduct independent evaluations via surveys
5. The system provides **mathematical models** (redundancy index, utilization, work sampling) to help orgs optimize staffing
6. **Gamification** (badges, hall of fame, book of records) incentivizes performance

The dual `academic` vs `industrial` category tracks show it's built for **universities** (lecturers, faculties) and **enterprises** (industrial engineers, maintenance models).

---

## 4. Is This Production-Grade? What's Missing?

> [!CAUTION]
> **No, this is NOT production-grade.** Despite the README claiming "Production Ready ✅", there are critical issues.

### What's Missing (Prioritized)

#### 🔴 Critical (Must fix — blocks production)

| # | Issue | Estimated Fix Time |
|---|-------|--------------------|
| 1 | **Security vulnerabilities** (see Section 5) | 2–3 weeks |
| 2 | **No automated tests** — zero unit, integration, or e2e tests | 3–4 weeks |
| 3 | **Inconsistent auth** — `extractAndVerifyToken()` exists but is **never used** in any API route; most routes use `jwt.decode()` (no verification!) | 1–2 weeks |
| 4 | **`backup.sql` (92KB) in git** — may contain real user data, passwords | 1 day |
| 5 | **Sensitive data in console.log** — passwords logged in [signup route](file:///d:/work/pes-software/app/api/signup/route.ts#L135), tokens in multiple routes | 2–3 days |

#### 🟠 High Priority (Should fix before launching to new users)

| # | Issue | Estimated Fix Time |
|---|-------|--------------------|
| 6 | **No rate limiting on most routes** — middleware only covers a few routes; 80+ routes are unprotected | 1 week |
| 7 | **No RBAC enforcement on API routes** — role check is only on the frontend sidebar, not on backend | 2 weeks |
| 8 | **No pagination** — queries like `SELECT * FROM pesuser` return ALL rows | 1 week |
| 9 | **No input validation on ~90% of routes** — Zod schemas exist but aren't applied | 2 weeks |
| 10 | **JWT tokens never expire** — login route signs without `expiresIn`; `signToken` helper uses `7d` but isn't used | 1 day |

#### 🟡 Medium Priority (Quality & Maintainability)

| # | Issue | Estimated Fix Time |
|---|-------|--------------------|
| 11 | Missing error boundaries (React) | 2 days |
| 12 | No CI/CD pipeline | 1 week |
| 13 | No logging infrastructure (structured logging, log levels) | 1 week |
| 14 | No monitoring/alerting (Sentry, etc.) | 2 days |
| 15 | Font loading broken (Lato commented out in layout) | 1 hour |
| 16 | No API documentation (Swagger/OpenAPI) | 1 week |
| 17 | Database migrations not managed properly (raw SQL files vs Prisma Migrate) | 1 week |

### Total Estimated Time to Production-Grade

> **8–12 weeks** of focused full-time development, assuming one experienced developer.
> 
> This breaks down as:
> - Security hardening: 3–4 weeks
> - Testing (unit + e2e): 3–4 weeks
> - Infrastructure & DevOps: 1–2 weeks
> - Code quality & cleanup: 1–2 weeks

---

## 5. Security & Feature Pitfalls — Critical Analysis

### 🔴 CRITICAL Security Issues

#### 5.1 — JWT Decode Without Verification (Broken Authentication)

**Severity: CRITICAL** | **Files: 7+ API routes**

Multiple API routes use `jwt.decode()` instead of `jwt.verify()`. This means **anyone can forge a JWT token** and the server will trust it.

```diff
// VULNERABLE — in getUsers/route.ts, getGoals/route.ts, getEmployee/route.ts, etc.
- const user = jwt.decode(token);     // ❌ No signature verification!
+ const user = jwt.verify(token, process.env.JWT_SECRET!);  // ✅ Verified
```

**Affected routes:**
- [getUsers/route.ts](file:///d:/work/pes-software/app/api/getUsers/route.ts#L34)
- [getGoals/route.ts](file:///d:/work/pes-software/app/api/getGoals/route.ts#L31)
- [getEmployee/route.ts](file:///d:/work/pes-software/app/api/getEmployee/route.ts#L39)
- [getRoles/route.ts](file:///d:/work/pes-software/app/api/getRoles/route.ts#L14)
- [getUser/route.ts](file:///d:/work/pes-software/app/api/getUser/route.ts#L61)
- [getDepartment/route.ts](file:///d:/work/pes-software/app/api/getDepartment/route.ts#L14)
- [api/middleware.ts](file:///d:/work/pes-software/app/api/middleware.ts#L18)

> [!CAUTION]
> The `extractAndVerifyToken()` function in [jwt.ts](file:///d:/work/pes-software/app/lib/jwt.ts) was built to solve this, but **no API route imports or uses it**. The security infrastructure was written but never wired in.

---

#### 5.2 — Plaintext Password Fallback (Login Route)

**Severity: CRITICAL** | **File:** [login/route.ts](file:///d:/work/pes-software/app/api/login/route.ts#L20-L27)

```typescript
// If password doesn't look like bcrypt, compare as PLAIN TEXT
const isBcrypt = user.password?.startsWith('$2a$') || ...;
if (isBcrypt) {
  isMatch = await bcrypt.compare(password, user.password);
} else {
  isMatch = password === user.password;  // ❌ Plaintext comparison!
}
```

This means any legacy user with a plaintext password in the DB can log in — and their password is stored **unencrypted**. An attacker with DB read access gets instant credentials.

---

#### 5.3 — SQL Injection via `$queryRawUnsafe` (45+ occurrences)

**Severity: HIGH** | **Files: 30+ API routes**

Despite the README claiming SQL injection was fixed, there are **45+ uses of `$queryRawUnsafe`** remaining across the codebase. While many use parameterized `$1, $2` placeholders (which is safe), several use **string interpolation**:

Key vulnerable files include routes in:
- [stress-analysis/route.ts](file:///d:/work/pes-software/app/api/stress-analysis/route.ts)
- [staffAppraisal/route.ts](file:///d:/work/pes-software/app/api/staffAppraisal/route.ts)
- [paystack/upgrade/route.ts](file:///d:/work/pes-software/app/api/paystack/upgrade/route.ts)
- [users/delete/route.ts](file:///d:/work/pes-software/app/api/users/delete/route.ts)

---

#### 5.4 — Credential Logging

**Severity: HIGH** | **File:** [signup/route.ts](file:///d:/work/pes-software/app/api/signup/route.ts#L135)

```typescript
console.log(email, password)  // ❌ Logs plaintext password to server logs!
```

Also in [signup/route.ts L163](file:///d:/work/pes-software/app/api/signup/route.ts#L163):
```typescript
console.log(token, 'before send', user.name)  // ❌ Logs JWT to server logs
```

And [resetPassword/route.ts L59](file:///d:/work/pes-software/app/api/resetPassword/route.ts#L59):
```typescript
console.log('Password reset link:', resetLink)  // ❌ Logs reset token
```

---

#### 5.5 — No Authorization (Broken Access Control)

**Severity: HIGH** | **Files: All API routes**

There is **no server-side role/permission check** on any API route. The role-based access control exists only in the frontend sidebar (which tabs are visible). Any authenticated user can call any API endpoint.

For example:
- A regular **employee** can call `/api/addEmployee` to create users
- A regular **employee** can call `/api/delete-user` to delete users
- Any user can call `/api/getUsers` to list ALL users in the org

---

#### 5.6 — Fallback JWT Secret

**Severity: HIGH** | **Files:** [login/route.ts](file:///d:/work/pes-software/app/api/login/route.ts#L66), [signup/route.ts](file:///d:/work/pes-software/app/api/signup/route.ts#L161), [jwt.ts](file:///d:/work/pes-software/app/lib/jwt.ts#L30)

```typescript
process.env.JWT_SECRET || 'fallback-secret-change-in-production'
```

If `JWT_SECRET` is not set (common in deployment misconfigurations), the app silently uses a **publicly known hardcoded secret**. This should throw an error and refuse to start.

---

### 🟠 HIGH Security Issues

#### 5.7 — No CSRF Protection

CSRF validation code exists in [app/middleware.ts](file:///d:/work/pes-software/app/middleware.ts#L181-L186) but is **commented out**. State-changing operations (password change, user creation, data deletion) are vulnerable.

#### 5.8 — In-Memory Rate Limiting

Rate limiting uses a JavaScript `Map` — this resets on every server restart, doesn't work across multiple instances, and can be memory-leaked in long-running processes. Production needs Redis or similar.

#### 5.9 — Database Backup in Repository

[backup.sql](file:///d:/work/pes-software/backup.sql) (92KB) is committed to git and **not in `.gitignore`**. If this contains real user data, it's a data breach waiting to happen. The schema SQL files ([pes_schema.sql](file:///d:/work/pes-software/pes_schema.sql), [queries.sql](file:///d:/work/pes-software/queries.sql), [script.sql](file:///d:/work/pes-software/script.sql)) also shouldn't be in the repo root.

#### 5.10 — XSS in Email Templates

[addEmployee/route.ts](file:///d:/work/pes-software/app/api/addEmployee/route.ts#L86-L93) injects user-supplied `name` directly into HTML email without sanitization:
```typescript
const html = `<h2>Hello ${name},</h2>`  // ❌ No HTML escaping
```

---

### 🟡 Feature Pitfalls

#### 5.11 — Two Conflicting Middlewares

There are **two middleware files**:
- [middleware.ts](file:///d:/work/pes-software/middleware.ts) (root) — role-based route protection using cookies
- [app/middleware.ts](file:///d:/work/pes-software/app/middleware.ts) — rate limiting + JWT verification

Next.js only uses the root `middleware.ts`. The `app/middleware.ts` is **dead code** — it never executes. All the rate limiting and JWT verification it implements is inactive.

> [!WARNING]
> This is arguably the single most impactful bug. The security middleware (rate limiting, JWT verification) that the README documents as "implemented" **does not actually run**.

#### 5.12 — Dual Payment Systems, Incomplete Integration

Both Paystack and PayPal integrations exist, but:
- Webhook verification is minimal
- No idempotency for webhook handlers
- No retry/reconciliation logic
- Subscription status can get out of sync

#### 5.13 — `resetToken` / `resetTokenExpiry` Not in Prisma Schema

The [resetPassword route](file:///d:/work/pes-software/app/api/resetPassword/route.ts#L46-L52) writes to `resetToken` and `resetTokenExpiry` columns, but these fields are **not defined in [schema.prisma](file:///d:/work/pes-software/prisma/schema.prisma)**. They exist only via raw SQL migration. This will cause Prisma Client type errors.

#### 5.14 — `reference` Generated at Module Load

In [signup/route.ts](file:///d:/work/pes-software/app/api/signup/route.ts#L7):
```typescript
const reference = `PES_${randomUUID()}`; // Generated ONCE at module load
```
Every signup request reuses the **same reference** until the server restarts. This will cause unique constraint violations on the `subscriptions_info.reference` column.

#### 5.15 — `SELECT *` Exposing Passwords

[getUsers/route.ts](file:///d:/work/pes-software/app/api/getUsers/route.ts#L26):
```typescript
const users = await prisma.$queryRawUnsafe('SELECT * FROM pesuser where org = $1', ...)
```
Returns **all columns including password hashes** to the frontend.

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **Concept & Vision** | 8/10 | Strong domain, real problem, good feature breadth |
| **Security** | 3/10 | Critical vulnerabilities in auth, authorization, and data exposure |
| **Code Quality** | 4/10 | Inconsistent, heavy `any` usage, no tests, dead code |
| **Production Readiness** | 2/10 | Multiple blockers before safe deployment |
| **Architecture** | 4/10 | No service layer, monolithic routes, dual middleware conflict |
| **UX/Frontend** | 6/10 | Functional but basic; role-based nav works |
| **Database Design** | 7/10 | Comprehensive schema, good indices, proper constraints |
| **Documentation** | 6/10 | Detailed README but contains inaccurate claims ("Production Ready") |

---

## Recommended Action Plan

### Week 1–2: Security Emergency
1. Fix JWT: Use `verify()` everywhere, kill the fallback secret, add expiry
2. Remove all `console.log` of sensitive data
3. Add server-side RBAC to all API routes
4. Remove `backup.sql` from git history (`git filter-branch` or BFG)

### Week 3–4: Consolidate Middleware & Auth
5. Merge the two middlewares into the root `middleware.ts`
6. Convert `$queryRawUnsafe` → `$queryRaw` (tagged template) everywhere
7. Apply Zod validation to all routes (schemas already exist!)
8. Fix the `reference` bug in signup

### Week 5–8: Testing & Quality
9. Add Vitest/Jest for unit tests (start with auth & critical business logic)
10. Add Playwright/Cypress for e2e tests
11. Set up CI/CD pipeline
12. Add structured logging (Pino or Winston)

### Week 9–12: Production Infrastructure
13. Redis for rate limiting + session management
14. Error monitoring (Sentry)
15. Database backup strategy (automated, not in git)
16. API pagination
17. Refresh token mechanism
