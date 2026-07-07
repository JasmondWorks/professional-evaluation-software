# PES Software — Exhaustive Project Analysis

This document provides a truly exhaustive analysis of the PES (Performance Evaluation Software) project. It expands on previous security, codebase, and mathematical model audits to include the entire frontend component tree, the subscription/payment flow, gamification modules, and a critical architectural flaw regarding data retrieval.

---

## 1. The "Write-Only" Black Hole Architecture

> [!CAUTION]
> **Major Architectural Discovery:** The user is absolutely correct — for the majority of the complex mathematical models, **there is no way to retrieve the persisted values.** The system acts as a write-only black hole.

**How it works currently:**
1. The user navigates to a form in `app/(admin)/models/` (e.g., `personnel-utilization`, `stress`, `org-structure`, `redundancy-index`).
2. They input parameters and hit "Submit" or "Run Model".
3. The frontend does the computation and/or calls a `POST` API route (like `/api/personnelUtilization/route.ts`).
4. The backend `INSERT`s the result into the database (e.g., `personnel_utilization`, `personnel_redundancy`, `stress_analysis_results`).
5. **The flow ends here.**

**The Missing Piece:**
There are **zero `GET` API routes** and **no UI dashboard components** built to retrieve, display, graph, or report on this persisted model data. 
- You cannot view historical `personnel_utilization` data.
- You cannot see past `stress_analysis_results`.
- You cannot track `personnel_redundancy` over time.

The data is successfully saved to PostgreSQL, but the application provides no mechanism to actually view or use it after submission. The buttons simply run the math and store it in a void.

---

## 2. Gamification: Hall of Fame & Book of Records

To incentivize employees, the system includes a "Hall of Fame" and "Book of Records" (`first-book-api`, `second-book-api`).

### Implementation Details:
- **Routes:** `app/api/hall-of-fame/route.ts`, `app/api/first-book-api/performance/route.ts`
- **Logic:** These are some of the only functional `GET` routes in the application that actually retrieve data from the database and surface it to the UI. They support basic pagination (`page`, `limit`, `offset`).
- **Security Flaw:** These routes are completely unauthenticated. Anyone hitting `/api/first-book-api/performance` can retrieve all performance records, descriptions, and user achievements. There is no role check or JWT validation on these endpoints.

---

## 3. Subscription & Payment Flow (Paystack)

The application monetizes via tiered subscriptions using Paystack and PayPal (`app/api/paystack`, `app/api/paypal`).

### Webhook Implementation (`paystack/webhook/route.ts`)
- **The Good:** The webhook correctly verifies the Paystack signature using HMAC SHA-512 (`crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)`). This prevents attackers from spoofing payment success events.
- **The Logic:** It handles upgrades correctly (marking previous plans as `upgraded`) and inserts new plans into `subscriptions_info` with an idempotency check (`ON CONFLICT (reference) DO NOTHING`).

### Active Subscription Check (`subscriptions/active/route.ts`)
- **The Bad:** The `GET` route to check if an organization/user has an active subscription expects an `email` in the URL query string (`?email=admin@org.com`).
- **The Flaw:** There is no authentication check. An attacker can query the subscription status, plan name, and expiry date of any organization simply by guessing their email address.

---

## 4. Frontend Architecture, State, and Routing

### Role-Based Routing
The app is split into distinct frontend zones based on roles:
- `app/(admin)`: Full dashboard, access to run mathematical models, goals, surveys, and billing.
- `app/employee`: A limited view for self-appraisals and viewing goals.
- *(Note: The `app/(hod)` folder does not exist, implying HOD logic is currently bundled into the admin or employee views, or hasn't been built).*

### State Management (`app/state/store.ts`)
The frontend is heavily state-dependent, using **Redux Toolkit** with 12+ slices (`goal`, `notification`, `action`, `task`, `user`, etc.). 
- While the frontend state architecture is robust, it sends its data to a highly fragile backend.

### IDOR in Data Fetching
When the dashboard (like `Quickstats.tsx`) needs to fetch stats (number of employees, appraisals), it decodes the JWT locally, extracts the `user` (org name), and sends it in the body of a `POST` request to `/api/getStats`.
- **Architectural Flaw:** The backend API routes blindly accept this string and fetch data based on it. Any user can fetch any organization's top-level stats by changing the string in the payload.

---

## 5. Summary of Backend Security & Structural Debt

Even factoring in the gamification and payment flows, the core backend structural issues remain:

1. **Dead Security Middleware:** `app/middleware.ts` (handling JWT verification and rate limiting) is ignored by Next.js. None of the API routes are actually protected by middleware.
2. **Fake JWT Verification:** API routes use `jwt.decode(token)` instead of `jwt.verify(token, secret)`. The server accepts **any forged token**.
3. **Widespread SQL Injection:** **45+ instances** of `prisma.$queryRawUnsafe` exist, often interpolating user input directly.
4. **Data Exposure:** Routes like `/api/getUsers` execute `SELECT * FROM pesuser` and return password hashes to the frontend.

---

## 6. Updated Unified Action Plan

### Phase 1: Complete the "Black Hole" Loop (Weeks 1-3)
- Build the missing `GET` API routes for `personnelUtilization`, `stress_analysis_results`, `personnel_redundancy`, etc.
- Build the corresponding frontend dashboard components in `app/(admin)/dashboard/` or `app/(admin)/models/` to display historical tables and charts of the persisted model data.

### Phase 2: Stop the Security Bleeding (Weeks 4-5)
- **Fix JWT Auth:** Replace all `jwt.decode` with `jwt.verify`. Consolidate `app/middleware.ts` into the root middleware.
- **Secure Data Fetching:** Stop sending `email` or `user` strings in API request bodies/query params to fetch data (e.g., `/api/getStats`, `/api/subscriptions/active`). The backend must extract this identity from the cryptographically verified JWT.

### Phase 3: Eradicate SQL Injection & Enforce Types (Weeks 6-8)
- Audit all uses of `$queryRawUnsafe`. Convert them to Prisma ORM calls (e.g., `prisma.pesuser.findMany()`) or safe tagged templates (`$queryRaw`).
- Implement the existing Zod validation schemas across all `POST` routes.

### Phase 4: Production Polish (Weeks 9-12)
- Move all mathematical computations (like the Queuing Theory loops) off the frontend and strictly onto the backend.
- Implement Jest unit tests for the core Operations Research models.
- Purge `backup.sql` from Git history.
